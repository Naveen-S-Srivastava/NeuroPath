#!/usr/bin/env python3
"""
EEG Prediction CLI Tool
Usage: python eeg_predict.py <csv_file_path>
"""

import sys
import torch
import torch.nn as nn
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import json
import os

# Configuration
MODEL_PATH = os.path.join(os.path.dirname(__file__), "neuro_chatbot_model(eeg)/dataset/best_eeg_model.pth")
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
    except TypeError:
        checkpoint = torch.load(MODEL_PATH, map_location=device)
        model.load_state_dict(checkpoint)
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
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python eeg_predict.py <csv_file_path>"}))
        sys.exit(1)

    csv_file = sys.argv[1]

    if not os.path.exists(csv_file):
        print(json.dumps({"error": f"File not found: {csv_file}"}))
        sys.exit(1)

    try:
        # Load model
        model = load_model()

        # Read CSV
        df = pd.read_csv(csv_file)

        # Preprocess and predict
        X = preprocess_eeg_data(df)
        preds = predict_eeg(model, X)

        # Format results
        results = []
        for i, pred in enumerate(preds):
            results.append({
                "sample": i + 1,
                "prediction": int(pred),
                "meaning": LABEL_MEANINGS.get(pred, "Unknown")
            })

        output = {
            "success": True,
            "file_processed": os.path.basename(csv_file),
            "num_records": len(results),
            "results": results
        }

        print(json.dumps(output))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()