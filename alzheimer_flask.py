import os
import io
from dotenv import load_dotenv
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS

# =====================================
# 🔧 Configuration
# =====================================
load_dotenv()

MODEL_PATH = "best_alzheimer_model.pth"
# Load API key from environment (recommended). To set it locally, create a .env file with ALZHEIMER_API_KEY=...
API_KEY = os.environ.get("ALZHEIMER_API_KEY", "")
if not API_KEY:
    print("⚠️  ALZHEIMER_API_KEY not set in environment. Requests to /predict will be rejected unless you set the key.")
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
                print("✅ Model loaded successfully (weights_only=True).")
            except TypeError:
                model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
                print("✅ Model loaded successfully (legacy mode).")
        else:
            print(f"⚠️  Model file not found at {MODEL_PATH}. Using untrained model for testing.")
            print("📝 To use a trained model, place your 'best_alzheimer_model.pth' file in the same directory as this script.")

        model.to(DEVICE)
        model.eval()
        return model
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        # Return a simple model for testing
        model = models.resnet18(weights=None)
        model.fc = nn.Linear(model.fc.in_features, len(CLASS_NAMES))
        model.to(DEVICE)
        model.eval()
        return model

model = load_model()

# =====================================
# 🧠 Flask App Setup
# =====================================
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# =====================================
# 🔐 Helper: Verify API Key
# =====================================
def verify_api_key(api_key):
    if api_key != API_KEY:
        return False
    return True

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
@app.route('/predict', methods=['POST'])
def predict():
    # Verify API key
    api_key = request.headers.get('x-api-key')
    if not verify_api_key(api_key):
        return jsonify({"error": "Invalid or missing API Key."}), 401

    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']

        # Validate file type
        if not file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            return jsonify({"error": "Invalid file type. Please upload an image (jpg/jpeg/png)."}), 400

        # Read image bytes
        image_bytes = file.read()
        image_tensor = preprocess_image(image_bytes).to(DEVICE)

        # Model prediction
        with torch.no_grad():
            outputs = model(image_tensor)
            _, predicted = torch.max(outputs, 1)
            predicted_class = CLASS_NAMES[predicted.item()]
            meaning = CLASS_DESCRIPTIONS.get(predicted_class, "No description available.")

        return jsonify({
            "prediction": predicted_class,
            "meaning": meaning
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =====================================
# 🌐 Root Endpoint
# =====================================
@app.route('/')
def home():
    return jsonify({
        "message": "Welcome to Alzheimer MRI Classifier API 🚀",
        "usage": "POST /predict with an MRI image and 'x-api-key' header."
    })

# =====================================
# 🚀 Run the Server
# =====================================
if __name__ == "__main__":
    print("🚀 Starting Alzheimer MRI Classifier API server with Flask...")
    app.run(host="127.0.0.1", port=8000, debug=True)