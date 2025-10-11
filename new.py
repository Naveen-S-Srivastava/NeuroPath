import os
import io
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
from fastapi import FastAPI, File, UploadFile, Header, HTTPException
from fastapi.responses import JSONResponse

# =====================================
# 🔧 Configuration
# =====================================
MODEL_PATH = "best_alzheimer_model.pth"  # Changed to look in current directory
API_KEY = "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"  # 🔒 Replace this with your actual API key
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# =====================================
# 🧩 Model Setup
# =====================================
CLASS_NAMES = ["Mild Impairment", "Moderate Impairment", "No Impairment", "Very Mild Impairment"]

CLASS_DESCRIPTIONS = {
    "No Impairment": "No visible signs of Alzheimer's disease.",
    "Very Mild Impairment": "Early stage with very slight memory issues or confusion.",
    "Mild Impairment": "Mild cognitive decline, may affect daily activities.",
    "Moderate Impairment": "More noticeable cognitive impairment, requiring assistance."
}


def load_model():
    print(f"🧠 Using device: {DEVICE}")
    try:
        model = models.resnet18(weights=None)
        model.fc = nn.Linear(model.fc.in_features, len(CLASS_NAMES))
        
        if os.path.exists(MODEL_PATH):
            try:
                model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE, weights_only=True))
                print(" Model loaded successfully (weights_only=True).")
            except TypeError:
                model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
                print(" Model loaded successfully (legacy mode).")
        else:
            print(f"  Model file not found at {MODEL_PATH}. Using untrained model for testing.")
            print(" To use a trained model, place your 'best_alzheimer_model.pth' file in the same directory as this script.")
        
        model.to(DEVICE)
        model.eval()
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        # Return a simple model for testing
        model = models.resnet18(weights=None)
        model.fc = nn.Linear(model.fc.in_features, len(CLASS_NAMES))
        model.to(DEVICE)
        model.eval()
        return model


model = load_model()

# =====================================
# 🧠 FastAPI App Setup
# =====================================
try:
    app = FastAPI(
        title="Alzheimer MRI Classifier API (with API Key)",
        description="Upload an MRI image to detect the level of Alzheimer's impairment. Requires x-api-key in headers.",
        version="1.0.1"
    )
except Exception as e:
    print(f"Error creating FastAPI app: {e}")
    exit(1)

# =====================================
# 🔐 Helper: Verify API Key
# =====================================
def verify_api_key(api_key: str):
    if api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API Key.")

# =====================================
# 🧼 Image Preprocessing
# =====================================
def preprocess_image(image_bytes):
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return transform(image).unsqueeze(0)

# =====================================
# 🔮 Prediction Endpoint
# =====================================
@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    api_key: str = Header(None, alias="x-api-key")  # 🔒 API key required
):
    # Verify key
    verify_api_key(api_key)

    try:
        # Validate file type
        if not file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            return JSONResponse({"error": "Invalid file type. Please upload an image (jpg/jpeg/png)."}, status_code=400)

        # Read image bytes
        image_bytes = await file.read()
        image_tensor = preprocess_image(image_bytes).to(DEVICE)

        # Model prediction
        with torch.no_grad():
            outputs = model(image_tensor)
            _, predicted = torch.max(outputs, 1)
            predicted_class = CLASS_NAMES[predicted.item()]
            meaning = CLASS_DESCRIPTIONS.get(predicted_class, "No description available.")

        return JSONResponse({
            "prediction": predicted_class,
            "meaning": meaning
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

# =====================================
# 🌐 Root Endpoint
# =====================================
@app.get("/")
def home():
    return {
        "message": "Welcome to Alzheimer MRI Classifier API 🚀",
        "usage": "POST /predict with an MRI image and 'x-api-key' header."
    }

# =====================================
# 🚀 Run the Server (only when run directly)
# =====================================
if __name__ == "__main__":
    try:
        import uvicorn
        print("Starting Alzheimer MRI Classifier API server...")
        uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
    except Exception as e:
        print(f"Error starting server: {e}")
        print("Make sure all dependencies are installed and the model file exists.")