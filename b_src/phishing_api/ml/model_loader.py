# Path: ml/model_loader.py

import torch
import logging
import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoConfig

logger = logging.getLogger(__name__)

class ModelHandler:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelHandler, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        try:
            # Set device
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            
            # Get model path from settings or use default
            from django.conf import settings
            model_path = getattr(settings, 'ML_MODEL_PATH', None)
            
            # Default to the original model if no path is provided
            if not model_path:
                model_name = "cybersectony/phishing-email-detection-distilbert_v2.4.1"
                logger.info(f"Using original model: {model_name}")
                
                # For the original model, load with the original 4 classes
                self.tokenizer = AutoTokenizer.from_pretrained(model_name)
                self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
            else:
                logger.info(f"Loading fine-tuned model from: {model_path}")
                
                # For your fine-tuned model, use the correct config with 2 classes
                self.tokenizer = AutoTokenizer.from_pretrained(model_path)
                
                # Load the config first to modify it
                config = AutoConfig.from_pretrained(model_path)
                
                # Override the config to use 2 classes
                config.num_labels = 2
                config.id2label = {0: "benign", 1: "phishing"}
                config.label2id = {"benign": 0, "phishing": 1}
                
                # Load the model with the modified config
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    model_path,
                    config=config,
                    ignore_mismatched_sizes=True  # Important for handling size mismatches
                )
            
            # Move model to device
            self.model.to(self.device)
            
            logger.info(f"Model loaded successfully on {self.device}")
            self._initialized = True
            
        except Exception as e:
            logger.error(f"Error initializing model: {str(e)}")
            raise
    
    def predict(self, email_text):
        """
        Make a prediction with the model.
        
        Args:
            email_text (str): The email text to classify
            
        Returns:
            dict: Prediction results including class and confidence
        """
        try:
            # Preprocess and tokenize
            inputs = self.tokenizer(
                email_text,
                return_tensors="pt",
                truncation=True,
                max_length=512
            ).to(self.device)
            
            # Get prediction
            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
            # Get probabilities for each class
            probs = predictions[0].cpu().tolist()
            
            # Determine the number of classes from the model's config
            num_labels = self.model.config.num_labels
            
            # Create labels dictionary based on the actual number of classes
            if num_labels == 4:
                class_labels = {
                    "legitimate_email": probs[0],
                    "phishing_url": probs[1],
                    "legitimate_url": probs[2],
                    "phishing_url_alt": probs[3]
                }
            elif num_labels == 2:
                class_labels = {
                    "benign": probs[0],
                    "phishing": probs[1]
                }
            else:
                # Generic fallback for any number of classes
                class_labels = {f"class_{i}": prob for i, prob in enumerate(probs)}
            
            # Determine the most likely classification
            max_label = max(class_labels.items(), key=lambda x: x[1])
            
            # Return in the format expected by the serializer
            return {
                "label": max_label[0],           # Changed from "prediction" to "label"
                "confidence": max_label[1],
                "probabilities": class_labels,    # Changed from "all_probabilities" to "probabilities"
            }
            
        except Exception as e:
            logger.error(f"Error during prediction: {str(e)}")
            raise