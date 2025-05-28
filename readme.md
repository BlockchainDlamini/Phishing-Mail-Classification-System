# AI Phishing Detection System

An intelligent email security solution that leverages machine learning to identify and classify phishing emails with high accuracy and explainable AI features.

## Performance Metrics

- **Accuracy**: 92.59%
- **Precision**: 93.42%
- **Recall**: 94.78%
- **False Positive Rate**: 11.02%

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

