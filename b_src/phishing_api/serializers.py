from rest_framework import serializers

class PredictionRequestSerializer(serializers.Serializer):
    """
    Serializer for model prediction requests.
    """
    input_text = serializers.CharField(required=True, help_text="Input text for model prediction")
    
    def validate_input_text(self, value):
        """
        Validate the input text.
        """
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Input text cannot be empty")
        return value


class PredictionResponseSerializer(serializers.Serializer):
    """
    Serializer for model prediction responses.
    """
    label = serializers.CharField()
    confidence = serializers.FloatField()
    probabilities = serializers.DictField(
        child=serializers.FloatField()
    )

