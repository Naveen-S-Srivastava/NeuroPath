#!/usr/bin/env python3
"""
Run script for Alzheimer MRI Classifier API
"""
import uvicorn
from new import app

if __name__ == "__main__":
    print("🚀 Starting Alzheimer MRI Classifier API server...")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")