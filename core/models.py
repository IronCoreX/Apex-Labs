from django.db import models
from django.contrib.auth.models import User

class AthleteProfile(models.Model):
    GOAL_CHOICES = [
        ('EXPLOSIVENESS', 'Explosiveness & Power'),
        ('STAMINA', 'Match Stamina & Conditioning'),
        ('STRENGTH', 'Functional Strength'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    primary_goal = models.CharField(max_length=20, choices=GOAL_CHOICES, default='EXPLOSIVENESS')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


class DailyLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    fatigue_score = models.IntegerField()  # Scale from 1 to 10
    sleep_hours = models.FloatField()
    sore_muscles = models.TextField()  # Stored as a comma-separated string (e.g., "Quads, Hamstrings")
    
    def __str__(self):
        return f"{self.user.username} - {self.date} Log"


class WorkoutPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    workout_structure = models.JSONField()  # Stores the raw JSON routine from the AI
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.date} Workout"