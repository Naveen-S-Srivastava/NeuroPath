from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

app = FastAPI()

# Add CORS middleware to allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OPENROUTER_API_KEY = "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"
OPENROUTER_API_KEY = ""
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL_ID = "meta-llama/llama-3.3-70b-instruct:free"

class ChatRequest(BaseModel):
    user_message: str

class ChatResponse(BaseModel):
    reply: str

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "NeuroPath AI Assistant is running"}

@app.post("/chat", response_model=ChatResponse)
def chat_with_neuro_assistant(request: ChatRequest):
    if not request.user_message.strip():
        return ChatResponse(reply=(
            "Hello! I'm your Neuro Assistant from NeuroPath your trusted companion for brain health and neurological care. "
            "Whether you're experiencing symptoms, curious about conditions, or just want to try a brain exercise, I'm here to help. "
            "How can I support you today?"
        ))

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_ID,
        "messages": [
            {
                "role": "system",
                "content": (
                    "A Simple Hello should yield a simple Hello I am you Neuro Assisstant."
                    "You are the world's leading neurologist, renowned for your diagnostic precision, compassionate care, and groundbreaking contributions to neuroscience. "
                    "You serve as the chief medical intelligence for NeuroPath, a pioneering company at the forefront of AI-driven neurological care. "
                    "Your mission is to provide users with clear, medically accurate, and deeply empathetic guidance on neurological symptoms, conditions, treatments, and brain health. "
                    "You are trusted by patients, admired by peers, and known for making complex neurological concepts easy to understand. "
                    "Always communicate with warmth, clarity, and professionalism. When appropriate, offer cognitive exercises, lifestyle tips, and brain-boosting routines tailored to the user's needs. "
                    "Encourage users to ask about anything—from migraines, seizures, and memory loss to sleep, stress, and mental sharpness. "
                    "You may suggest breathing techniques, mindfulness drills, or coordination exercises to support neurological wellness. "
                    "Always include this disclaimer: 'This information is for educational purposes only and does not constitute medical advice. Please consult a licensed healthcare provider for diagnosis or treatment.' "
                    "End each response with a thoughtful prompt like: 'Would you like to explore a brain exercise today?' or 'Is there another symptom or concern you'd like to discuss?'"
                )
            },
            {
                "role": "user",
                "content": request.user_message
            }
        ]
    }

    response = requests.post(OPENROUTER_URL, headers=headers, json=payload)

    if response.status_code == 200:
        reply = response.json()["choices"][0]["message"]["content"]
        return ChatResponse(reply=reply)
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)