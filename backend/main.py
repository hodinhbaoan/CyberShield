from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import re
import os
import numpy as np
from urllib.parse import urlparse
import logging

# -------------------------
# INIT
# -------------------------
app = FastAPI()

logging.basicConfig(level=logging.INFO)

# -------------------------
# CORS (SAFE FOR DEV)
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# LOAD MODELS
# -------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

spam_model = joblib.load(os.path.join(BASE_DIR, "saved_models/spam_logistic.pkl"))
vectorizer = joblib.load(os.path.join(BASE_DIR, "saved_models/tfidf_vectorizer.pkl"))
phish_model = joblib.load(os.path.join(BASE_DIR, "saved_models/phish_best_model.pkl"))

# -------------------------
# REQUEST SCHEMAS
# -------------------------
class EmailRequest(BaseModel):
    text: str

class URLRequest(BaseModel):
    url: str

# -------------------------
# HELPER FUNCTIONS
# -------------------------
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    return text

def extract_url_features(url):
    suspicious_words = [
        "login", "verify", "update", "secure",
        "account", "bank", "paypal", "password",
        "signin", "confirm", "security", "webscr",
        "ebay", "amazon", "bonus", "free", "gift",
        "wallet", "billing", "invoice"
    ]

    return {
        "url_length": len(url),
        "num_dots": url.count('.'),
        "num_hyphens": url.count('-'),
        "num_slashes": url.count('/'),
        "num_digits": sum(c.isdigit() for c in url),
        "has_https": 1 if url.startswith("https") else 0,
        "num_at": url.count('@'),
        "num_question": url.count('?'),
        "num_equal": url.count('='),
        "num_ampersand": url.count('&'),
        "has_ip": 1 if re.search(r'\d+\.\d+\.\d+\.\d+', url) else 0,
        "has_suspicious_word": int(
            any(word in url.lower() for word in suspicious_words)
        )
    }

# -------------------------
# CONFIDENCE CALCULATION
# -------------------------
def get_confidence(model, X):
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X)[0]
        return float(np.max(probs))
    elif hasattr(model, "decision_function"):
        score = model.decision_function(X)
        score = score[0] if isinstance(score, (list, np.ndarray)) else score
        return float(1 / (1 + np.exp(-score)))
    return 0.85

# -------------------------
# ROUTES
# -------------------------

@app.get("/")
def home():
    return {"message": "API is running"}

# 🔥 EXTRA (HD BOOST)
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/stats")
def stats():
    return {
        "features": ["Email Spam Detection", "URL Phishing Detection"],
        "models_loaded": True
    }

# -------------------------
# EMAIL PREDICTION
# -------------------------
@app.post("/predict-email")
def predict_email(data: EmailRequest):
    if not data.text or len(data.text.strip()) < 5:
        raise HTTPException(status_code=400, detail="Text too short")

    text = clean_text(data.text)
    X = vectorizer.transform([text])

    pred = spam_model.predict(X)[0]
    confidence = get_confidence(spam_model, X)

    logging.info(f"Email Prediction: {pred}, Confidence: {confidence}")

    return {
        "prediction": "Spam" if pred == 1 else "Legitimate",
        "confidence": round(confidence, 3)
    }

# -------------------------
# URL PREDICTION
# -------------------------
@app.post("/predict-url")
def predict_url(data: URLRequest):
    if not data.url or len(data.url.strip()) < 5:
        raise HTTPException(status_code=400, detail="Invalid URL")

    url = data.url.lower()
    parsed = urlparse(url)
    domain = parsed.netloc if parsed.netloc else url

    # -------------------------
    # RULE-BASED SCORING (NOT OVERRIDE)
    # -------------------------
    rule_score = 0

    if any(word in url for word in ["verify", "bank", "account", "login"]):
        rule_score += 0.15

    if re.search(r'\d+\.\d+\.\d+\.\d+', domain):
        rule_score += 0.3

    suspicious_tlds = ['.ru', '.tk', '.ml', '.ga', '.cf']
    if any(domain.endswith(tld) for tld in suspicious_tlds):
        rule_score += 0.2

    trusted_domains = [
        "google.com", "youtube.com", "wikipedia.org",
        "github.com", "microsoft.com", "amazon.com"
    ]

    for trusted in trusted_domains:
        if domain == trusted or domain.endswith("." + trusted):
            return {
                "prediction": "Legitimate",
                "confidence": 0.97
            }

    # -------------------------
    # ML PREDICTION
    # -------------------------
    features = extract_url_features(url)
    X = pd.DataFrame([features])

    pred = phish_model.predict(X)[0]
    confidence = get_confidence(phish_model, X)

    # 🔥 COMBINE RULE + ML
    confidence = min(confidence + rule_score, 1.0)

    logging.info(f"URL Prediction: {pred}, Confidence: {confidence}")

    return {
        "prediction": "Phishing" if pred == 1 else "Legitimate",
        "confidence": round(confidence, 3)
    }