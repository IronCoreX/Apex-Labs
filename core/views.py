import os
import json
from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from openai import OpenAI
from dotenv import load_dotenv
from .models import DailyLog, WorkoutPlan
from .serializers import DailyLogSerializer

# Load variables from our secure .env file
load_dotenv()

# Initialize the OpenAI client engine
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class DailyLogViewSet(viewsets.ModelViewSet):
    """
    Handles saving and retrieving user logs behind the scenes.
    """
    serializer_class = DailyLogSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return DailyLog.objects.filter(user=self.request.user).order_by('-date')
        return DailyLog.objects.all().order_by('-date')


@api_view(['POST'])
@permission_classes([AllowAny])
def generate_ai_workout(request):
    """
    Ingests live athletic telemetry, orchestrates a system prompt,
    enforces a strict JSON response from OpenAI, and serves it to React.
    """
    data = request.data
    profile = data.get('profile', 'gym')
    
    # 1. Dynamically build a clear, simple context string for the AI
    if profile == 'football':
        intensity = data.get('intensity', 5)  # 1 = Light kickabout, 10 = Heavy match
        user_metrics_context = f"Athlete Profile: Football player preparing for a session. Current physical readiness/energy score is {intensity}/10."
    else:
        energy = data.get('energy_level', 5)
        sleep = data.get('sleep_hours', 7)
        soreness = data.get('sore_muscles', 'None')
        user_metrics_context = f"Athlete Profile: General Gym/Weight Training. Today's energy level is {energy}/10. Sleep duration: {sleep} hours. Sore body parts: {soreness}."

    # 2. Craft the master system prompt enforcing strict data limits and simple language
    system_instruction = (
        "You are an inspiring, practical athletic coach. "
        "Your task is to review the user's daily metrics and output a highly specific, clean training blueprint.\n\n"
        
        "RULES FOR FOOTBALL PROFILE (PRE-SESSION TRAINING):\n"
        "1. Focus purely on pitch sharpness, speed, and skill work. Do not act like a doctor or prescribe medical rehab.\n"
        "2. Provide fun, approachable solo/partner football drills (e.g., cone dribbling, wall-passing touch drills, quick acceleration bursts) that make them sharper on the turf.\n"
        "3. Scale the drills based on their readiness score (if score is low, keep drills smooth and technical; if high, make them explosive).\n\n"
        
        "RULES FOR GYM PROFILE (ACCESSIBLE WEIGHT TRAINING):\n"
        "1. Prescribe standard, accessible exercises using basic equipment found in any small gym (like dumbbells, an adjustable bench, and pull-up bars/cables).\n"
        "2. Avoid overly complex barbell powerlifting setups or massive, specialized commercial machines.\n"
        "3. If a specific muscle group is sore (e.g., 'Chest'), DO NOT train that area directly. Instantly shift the exercises to opposing, healthy muscles (e.g., train back rows/pull-ups instead).\n\n"
        
        "TONE & FORMAT RULES:\n"
        "1. Use simple, direct, motivational coach language. Absolutely NO medical jargon or complex scientific dictionary words.\n"
        "2. Keep notes short, punchy, and brief.\n\n"
        
        "You must respond ONLY with a raw JSON object matching this exact schema structure:\n"
        "{\n"
        "  \"focus\": \"Short premium title stating today's direct training theme\",\n"
        "  \"notes\": \"A brief, 1-sentence tactical coach tip for today's session.\",\n"
        "  \"warmup\": [\"Simple warmup drill 1\", \"Simple warmup drill 2\"],\n"
        "  \"exercises\": [\n"
        "    {\"name\": \"Exercise Name\", \"sets\": 3, \"reps\": 8, \"rest\": \"60s\"}\n"
        "  ]\n"
        "}"
    )

    try:
        # 3. Fire the payload to OpenAI
        response = client.chat.completions.create(
            model="gpt-5.4-mini",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_metrics_context}
            ],
            temperature=0.7
        )
        
        ai_string_content = response.choices[0].message.content
        structured_workout_data = json.loads(ai_string_content)
        return Response({"status": "success", "workout": structured_workout_data})

    except Exception as e:
        print(f"AI Pipeline Error: {str(e)} - Triggering Adaptive Fallback Engine.")
        
        # FAULT-TOLERANT LOCAL FALLBACK
        if profile == 'football':
            fallback_data = {
                "focus": "Pitch Sharpness & Ball Control",
                "notes": "Keep your head up on the turf today. Scan the field before receiving every pass.",
                "warmup": ["5-Min Easy Jog & Arm Circles", "10-Meter High Knees & Butt Kicks"],
                "exercises": [
                    {"name": "Cone Weave Dribbling (Inside/Outside foot)", "sets": 3, "reps": "4 laps", "rest": "60s"},
                    {"name": "Wall Passing (Two-Touch Control)", "sets": 3, "reps": "20 passes", "rest": "45s"},
                    {"name": "Explosive Acceleration Sprints (15 Meters)", "sets": 4, "reps": 1, "rest": "90s"}
                ]
            }
        else:
            fallback_data = {
                "focus": "Full Body Dumbbell Strength",
                "notes": "Focus on controlled, steady movements today to maximize muscle tension.",
                "warmup": ["5-Min Light Cardio Warmup", "Arm Swings & Bodyweight Squats"],
                "exercises": [
                    {"name": "Dumbbell Shoulder Press", "sets": 3, "reps": 10, "rest": "60s"},
                    {"name": "Dumbbell Bent-Over Rows", "sets": 3, "reps": 12, "rest": "60s"},
                    {"name": "Goblet Squats (with Dumbbell)", "sets": 3, "reps": 12, "rest": "90s"}
                ]
            }
            
        return Response({"status": "success", "workout": fallback_data})