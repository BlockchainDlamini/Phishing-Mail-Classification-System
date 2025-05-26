#!/usr/bin/env python
"""
Script to test loading a local Hugging Face model.
Run this before starting the Django server to verify your model loads correctly.
"""
import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenva
import torch
from transformers import AutoTokenizer, AutoModel

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

def test_model_loading():
    """Test loading the local model specified in the .env file"""
    # Load environment variables
    load_dotenv()

    model_path = os.environ.get('LOCAL_MODEL_PATH')
    tokenizer_path = os.environ.get('LOCAL_TOKENIZER_PATH', model_path)

    if not model_path:
        logger.error("LOCAL_MODEL_PATH not specified in .env file")
        return False

    # Check if the model path exists
    if not Path(model_path).exists():
        logger.error(f"Model path does not exist: {model_path}")
        return False

    logger.info(f"Testing local model at {model_path}")

    try:
        # Try loading the tokenizer
        logger.info(f"Loading tokenizer from {tokenizer_path}")
        tokenizer = AutoTokenizer.from_pretrained(tokenizer_path)
        logger.info("✓ Tokenizer loaded successfully")

        # Try loading the model
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        logger.info(f"Loading model on {device}")
        model = AutoModel.from_pretrained(model_path).to(device)
        logger.info("✓ Model loaded successfully")

        # Test a simple inference (this will vary based on your model type)
        logger.info("Testing a simple inference")
        sample_text = "This is a test sentence."
        inputs = tokenizer(sample_text, return_tensors="pt").to(device)

        with torch.no_grad():
            outputs = model(**inputs)

        logger.info("✓ Model inference successful")
        logger.info(f"Output shape: {outputs.last_hidden_state.shape}")

        return True

    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_model_loading()
    if success:
        logger.info("✓✓✓ All tests passed! Your model is ready to use with Django.")
        sys.exit(0)
    else:
        logger.error("❌ Test failed. Please check your model configuration.")
        sys.exit(1)