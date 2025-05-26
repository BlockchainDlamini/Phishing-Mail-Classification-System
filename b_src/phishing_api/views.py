from django.shortcuts import render
# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging
from django.conf import settings

from .serializers import PredictionRequestSerializer, PredictionResponseSerializer
from .ml.model_loader import ModelHandler

logger = logging.getLogger(__name__)

class ModelPredictionAPIView(APIView):
    """
    API view for model predictions.
    """
    
    @swagger_auto_schema(
        request_body=PredictionRequestSerializer,
        responses={
            200: PredictionResponseSerializer,
            400: "Bad Request",
            500: "Internal Server Error"
        },
        operation_description="Make a prediction with the Hugging Face model"
    )
    def post(self, request, *args, **kwargs):
        """
        Handle POST requests to make predictions with the model.
        """
        # Validate request data
        serializer = PredictionRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Invalid request", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get the input text from the validated data
            input_text = serializer.validated_data['input_text']
            
            # Get singleton instance of model handler
            model_handler = ModelHandler()
            
            # Make prediction
            prediction_result = model_handler.predict(input_text)
            
            # Validate the response format
            response_serializer = PredictionResponseSerializer(data=prediction_result)
            if not response_serializer.is_valid():
                logger.error(f"Invalid response format: {response_serializer.errors}")
                return Response(
                    {"error": "Model returned invalid format", "details": response_serializer.errors},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            return Response(response_serializer.validated_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error during prediction: {str(e)}")
            return Response(
                {"error": "Prediction failed", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )