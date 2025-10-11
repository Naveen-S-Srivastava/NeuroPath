#!/usr/bin/env python3
"""
EEG Model Test Script
This script demonstrates the EEG seizure classification model functionality.
"""

import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
import os

# Configuration
MODEL_PATH = "eeg_models/best_eeg_model.pth"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Model Definition
class EEG_CNN_LSTM_Attention(nn.Module):
    def __init__(self, num_classes=5):
        super(EEG_CNN_LSTM_Attention, self).__init__()
        self.conv1 = nn.Conv1d(1, 16, 3, padding=1)
        self.bn1 = nn.BatchNorm1d(16)
        self.conv2 = nn.Conv1d(16, 32, 3, padding=1)
        self.bn2 = nn.BatchNorm1d(32)
        self.conv3 = nn.Conv1d(32, 64, 3, padding=1)
        self.bn3 = nn.BatchNorm1d(64)
        self.relu = nn.ReLU()
        self.pool = nn.MaxPool1d(2)
        self.lstm = nn.LSTM(64, 128, batch_first=True, bidirectional=True)
        self.attn = nn.MultiheadAttention(embed_dim=256, num_heads=4, batch_first=True)
        self.fc1 = nn.Linear(256, 128)
        self.dropout = nn.Dropout(0.4)
        self.fc2 = nn.Linear(128, num_classes)

    def forward(self, x):
        x = self.relu(self.bn1(self.conv1(x)))
        x = self.relu(self.bn2(self.conv2(x)))
        x = self.pool(self.relu(self.bn3(self.conv3(x))))
        x = x.permute(0, 2, 1)
        x, _ = self.lstm(x)
        attn_output, _ = self.attn(x, x, x)
        x = attn_output[:, -1, :]
        x = self.dropout(self.relu(self.fc1(x)))
        x = self.fc2(x)
        return x

# Load Model
def load_model():
    model = EEG_CNN_LSTM_Attention(num_classes=5).to(device)
    try:
        checkpoint = torch.load(MODEL_PATH, map_location=device, weights_only=True)
        model.load_state_dict(checkpoint)
        print("✅ Model loaded successfully (weights_only=True).")
    except TypeError:
        checkpoint = torch.load(MODEL_PATH, map_location=device)
        model.load_state_dict(checkpoint)
        print("✅ Model loaded successfully (legacy mode).")
    model.eval()
    return model

# Preprocessing
def preprocess_eeg_data(df):
    if "y" in df.columns:
        df = df.drop(columns=["y"])
    X = df.select_dtypes(include=["float64", "int64"]).values.astype("float32")
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    X = X.reshape(len(X), 1, X.shape[1])
    return X

# Prediction
def predict_eeg(model, X):
    x = torch.tensor(X, dtype=torch.float32).to(device)
    with torch.no_grad():
        outputs = model(x)
        _, predicted = torch.max(outputs, 1)
    preds = (predicted.cpu().numpy() + 1).tolist()
    return preds

# Label meanings
LABEL_MEANINGS = {
    1: "Healthy brain activity",
    2: "Mild epileptic activity",
    3: "Moderate epileptic activity",
    4: "Severe epileptic activity",
    5: "Seizure state",
}

def main():
    print("🧠 EEG Seizure Classification Model Test")
    print("=" * 50)
    print(f"Using device: {device}")
    print(f"Model path: {MODEL_PATH}")

    # Load model
    try:
        model = load_model()
        print("✅ Model ready for predictions!")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return

    # Test with sample data if available
    sample_csv = "eeg_models/epileptic.csv"
    if os.path.exists(sample_csv):
        print(f"\n📊 Testing with sample data from {sample_csv}")
        try:
            df = pd.read_csv(sample_csv)
            print(f"Loaded {len(df)} records with {len(df.columns)} features")

            # Take first 5 samples for testing
            test_df = df.head(5)
            X = preprocess_eeg_data(test_df)
            preds = predict_eeg(model, X)

            print("\n🔍 Prediction Results:")
            for i, pred in enumerate(preds):
                meaning = LABEL_MEANINGS.get(pred, "Unknown")
                print(f"  Sample {i+1}: Class {pred} - {meaning}")

        except Exception as e:
            print(f"❌ Error testing with sample data: {e}")
    else:
        print(f"\n⚠️  Sample data file not found: {sample_csv}")
        print("   You can test the model by providing your own EEG CSV data")

    print("\n🚀 EEG Model Configuration Complete!")
    print("   The model is ready for seizure classification tasks.")
    print("   Use the FastAPI server (when working) or this script for predictions.")

if __name__ == "__main__":
    main()