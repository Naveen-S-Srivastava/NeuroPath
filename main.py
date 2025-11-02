import os
import io
import torch
from dotenv import load_dotenv
import torch.nn as nn
from fastapi import FastAPI, UploadFile, File, Header, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime

# ================================
# Configuration
# ================================
load_dotenv()
# API key for the EEG prediction API. Set this in your environment or an .env file as EEG_API_KEY
API_KEY = os.environ.get("EEG_API_KEY", "")
if not API_KEY:
    print("⚠️  EEG_API_KEY not set in environment. Requests to /predict will be rejected unless you set the key.")
UPLOAD_DIR = "uploads"
MODEL_PATH = "neuro_chatbot_model(eeg)/dataset/best_eeg_model.pth"
os.makedirs(UPLOAD_DIR, exist_ok=True)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# ================================
# Model Definition
# ================================
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

# ================================
# Model Loading Function
# ================================
def load_model():
    global model
    if 'model' not in globals():
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

# ================================
# Helper Functions
# ================================
def verify_api_key(api_key: str):
    if api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API Key.")

def preprocess_eeg_data(df):
    import numpy as np
    from sklearn.preprocessing import StandardScaler
    
    if "y" in df.columns:
        df = df.drop(columns=["y"])
    X = df.select_dtypes(include=["float64", "int64"]).values.astype("float32")
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    X = X.reshape(len(X), 1, X.shape[1])
    return X

def predict_eeg(X):
    model = load_model()
    x = torch.tensor(X, dtype=torch.float32).to(device)
    with torch.no_grad():
        outputs = model(x)
        _, predicted = torch.max(outputs, 1)
    preds = (predicted.cpu().numpy() + 1).tolist()
    return preds

LABEL_MEANINGS = {
    1: "Healthy brain activity",
    2: "Mild epileptic activity",
    3: "Moderate epileptic activity",
    4: "Severe epileptic activity",
    5: "Seizure state",
}

# ================================
# FastAPI App
# ================================
eeg_app = FastAPI(
    title="EEG Prediction API (with API Key)",
    description="Upload EEG CSV data for epileptic seizure classification. Requires API Key in headers.",
    version="1.0.1"
)

@eeg_app.get("/")
def root():
    return {"message": "EEG Prediction API is running 🚀"}

@eeg_app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    api_key: str = Header(None, alias="x-api-key")  # 👈 expect API key in header
):
    verify_api_key(api_key)

    try:
        # Save uploaded CSV
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        save_path = os.path.join(UPLOAD_DIR, f"{timestamp}_{file.filename}")
        contents = await file.read()
        with open(save_path, "wb") as f:
            f.write(contents)

        print(f"✅ File saved: {save_path}")

        # Read & predict
        import pandas as pd
        df = pd.read_csv(io.BytesIO(contents))
        X = preprocess_eeg_data(df)
        preds = predict_eeg(X)
        results = [{"prediction": int(p), "meaning": LABEL_MEANINGS.get(p, "Unknown")} for p in preds]

        return JSONResponse(
            content={
                "file_saved_as": os.path.basename(save_path),
                "num_records": len(results),
                "results": results,
            }
        )

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(eeg_app, host="127.0.0.1", port=8001)