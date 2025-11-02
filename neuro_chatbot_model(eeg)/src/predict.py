import os
import numpy as np
import pandas as pd
import torch
import torch.nn as nn

#device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")

#model definition
class EEG_CNN_LSTM_Attention(nn.Module):
    def __init__(self, num_classes=5):
        super().__init__()
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
        attn_out, _ = self.attn(x, x, x)
        x = attn_out[:, -1, :]
        x = self.dropout(self.relu(self.fc1(x)))
        x = self.fc2(x)
        return x

#loading trained model
DATA_DIR = '../dataset/'
MODEL_PATH = os.path.join(DATA_DIR, 'best_eeg_model.pth')

model = EEG_CNN_LSTM_Attention(num_classes=5).to(device)
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.eval()
print("Model loaded successfully!")

#Scaling
SCALER_MEAN_PATH = os.path.join(DATA_DIR, 'scaler_mean.npy')
SCALER_SCALE_PATH = os.path.join(DATA_DIR, 'scaler_scale.npy')

if os.path.exists(SCALER_MEAN_PATH) and os.path.exists(SCALER_SCALE_PATH):
    scaler_mean = np.load(SCALER_MEAN_PATH)
    scaler_scale = np.load(SCALER_SCALE_PATH)
else:
    X_train = np.load(os.path.join(DATA_DIR, 'X_train.npy'))
    scaler_mean = X_train.mean(axis=(0,1))
    scaler_scale = X_train.std(axis=(0,1))

#Mapping
LABEL_MEANING = {
    1: "Healthy",
    2: "Seizure",
    3: "Interictal state",
    4: "Other abnormality type 1",
    5: "Other abnormality type 2"
}

#prediction
def predict_from_csv(csv_path):
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"{csv_path} not found!")

    # Load CSV
    df = pd.read_csv(csv_path)
    print("Raw CSV loaded. Shape:", df.shape)

    # Keep only numeric columns
    X = df.select_dtypes(include=['float64', 'int64']).values.astype(np.float32)

    # Standardize
    T = X.shape[1]
    X_scaled = (X - scaler_mean[:T]) / scaler_scale[:T]

    # Reshape to (N, 1, T)
    X_scaled = X_scaled[:, np.newaxis, :]

    # Convert to tensor
    X_tensor = torch.tensor(X_scaled, dtype=torch.float32).to(device)

    # Predict
    with torch.no_grad():
        outputs = model(X_tensor)
        _, predicted = torch.max(outputs, 1)

    # Convert to 1-5 labels
    predicted_classes = (predicted.cpu().numpy() + 1).tolist()

    # Map to meanings
    predictions_with_meaning = [(cls, LABEL_MEANING[cls]) for cls in predicted_classes]

    return predictions_with_meaning

#taking csv from user
if __name__ == "__main__":
    csv_file = input("Please enter the path to your raw EEG CSV file: ").strip()
    predictions = predict_from_csv(csv_file)
    print("\nPredictions:")
    for i, (cls, meaning) in enumerate(predictions):
        print(f"Sample {i+1}: Class {cls} --> {meaning}")
