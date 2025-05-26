# AI Phishing Detection System

An intelligent email security solution that leverages machine learning to identify and classify phishing emails with high accuracy and explainable AI features.

## Features

- **Advanced AI Detection**: DistilBERT-based model achieving 92.59% accuracy
- **Real-time Analysis**: Process emails at 61.62 samples/second
- **Explainable AI**: Detailed explanations for classification decisions
- **Multi-format Support**: Handles .eml email formats
- **RESTful API**: Django-based backend with clean API endpoints
- **Comprehensive Analysis**: Examines email content, headers, URLs, and metadata

## Performance Metrics

- **Accuracy**: 92.59%
- **Precision**: 93.42%
- **Recall**: 94.78%
- **False Positive Rate**: 11.02%
- **Processing Speed**: 61.62 samples/second

## Architecture

The system follows a modular architecture with clear separation of concerns:

- **Email Processing**: Feature extraction and preprocessing
- **ML Model**: DistilBERT-based classification engine
- **API Layer**: Django REST framework endpoints
- **Explainable AI**: Suspicious element highlighting and decision explanations

## Tech Stack

- **Backend**: Django, Django REST Framework
- **Machine Learning**: DistilBERT, Transformers, PyTorch
- **Data Processing**: Pandas, NumPy, Scikit-learn
- **API**: RESTful web services
- **File Handling**: Email parsing (.eml format)

## Requirements

```
torch
transformers
django
djangorestframework
pandas
numpy
scikit-learn
email-validator
```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-phishing-detection.git
   cd ai-phishing-detection
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run Django migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start the development server**
   ```bash
   python manage.py runserver
   ```

## Usage

### API Endpoint

**POST** `/api/predict/`

**Request Body:**
```json
{
  "email_content": "Your email content here",
  "subject": "Email subject",
  "sender": "sender@example.com"
}
```

**Response:**
```json
{
  "is_phishing": true,
  "confidence_score": 0.94,
  "suspicious_elements": ["suspicious phrase", "malicious URL"],
  "explanation": "Classification explanation",
  "timestamp": "2025-05-25T10:30:00Z"
}
```

### Example Usage

```python
import requests

# Prepare email data
email_data = {
    "email_content": "Urgent: Verify your account immediately...",
    "subject": "Account Verification Required",
    "sender": "security@fake-bank.com"
}

# Make prediction request
response = requests.post(
    "http://localhost:8000/api/predict/",
    json=email_data
)

result = response.json()
print(f"Phishing: {result['is_phishing']}")
print(f"Confidence: {result['confidence_score']:.2%}")
```

## Model Training

The model was trained over 4 epochs with the following progression:

| Epoch | Accuracy | Precision | Recall | FPR |
|-------|----------|-----------|--------|-----|
| 1     | 91.01%   | 94.96%    | 90.36% | 7.93% |
| 2     | 91.45%   | 93.77%    | 92.41% | 10.15% |
| 3     | 92.15%   | 94.99%    | 92.27% | 8.05% |
| 4     | 92.59%   | 93.42%    | 94.78% | 11.02% |

## Acknowledgments

- DistilBERT model by Hugging Face
- Django REST Framework
- Academic research in phishing detection
- COS720 Advanced Topics in Computer Science

---

*This project was developed as part of the COS720 Advanced Topics in Computer Science course, focusing on AI-powered cybersecurity solutions.*
