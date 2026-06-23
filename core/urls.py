from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DailyLogViewSet, generate_ai_workout

router = DefaultRouter()
router.register(r'logs', DailyLogViewSet, basename='dailylog')

urlpatterns = [
    path('', include(router.urls)),
    path('generate-workout/', generate_ai_workout, name='generate_ai_workout'),
]