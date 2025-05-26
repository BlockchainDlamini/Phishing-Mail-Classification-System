from django.urls import path
from .views import ModelPredictionAPIView

urlpatterns = [
    path('predict/', ModelPredictionAPIView.as_view(), name='model-predict'),
]