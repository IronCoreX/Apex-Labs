from rest_framework import serializers
from django.contrib.auth.models import User
from .models import AthleteProfile, DailyLog, WorkoutPlan

class UserSerializer(serializers.ModelSerializer):
    class Meta: 
        model = User
        fields = ['id', 'username', 'email']

class DailyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyLog
        fields = ['id', 'date', 'fatigue_score', 'sleep_hours', 'sore_muscles']

    def create(self, validated_data):
        #Automatically assign the logged-in user to the daily log recored 
        request = self.context.get('request')
        validated_data['user'] = request.user
        return super().create(validated_data)
    
class WorkoutPlanSerializer(serializers.ModelSerializer):
    class Meta: 
        model = WorkoutPlan
        fields = ['id', 'date', 'workout_structure', 'is_completed']