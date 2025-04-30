from django.urls import path
from .views import PredictTeamView, home

urlpatterns = [
    path('', home, name='home'),
    path('predict/', PredictTeamView.as_view(), name='predict_team'),
] 