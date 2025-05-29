# Phishing Mail Classiifcation System
An email security solution that leverages machine learning to identify and classify phishing emails with high accuracy and explainable AI features.

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

## Acknolewdgements

**Datasets**:
1. Naser Abdullah Alam. (2024). Phishing Email Dataset [Data set]. Kaggle. https://doi.org/10.34740/KAGGLE/DS/5074342
2. **Al-Subaiey, A., Al-Thani, M., Alam, N. A., Antora, K. F., Khandakar, A., & Zaman, S. A. U.** (2024, May 19). *Novel Interpretable and Robust Web-based AI Platform for Phishing Email Detection*. ArXiv.org.  
   Available at: [https://arxiv.org/abs/2405.11619](https://arxiv.org/abs/2405.11619)
3.This project uses data licensed under the [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/#ref-same-license).  
No changes were made to the original dataset.


**Fine-tuned Model**:
1. **Tony Kiplagat Cheptoo**. *A distilBERT based Phishing Email Detection Model*.  
Available at: [https://huggingface.co/cybersectony/phishing-email-detection-distilbert_v2.4.1](https://huggingface.co/cybersectony/phishing-email-detection-distilbert_v2.4.1), Author profile: [https://huggingface.co/cybersectony](https://huggingface.co/cybersectony)

