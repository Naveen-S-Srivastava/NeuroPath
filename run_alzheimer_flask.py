#!/usr/bin/env python3
"""
Run script for Alzheimer MRI Classifier API (Flask version)
"""
from alzheimer_flask import app

if __name__ == "__main__":
    print("🚀 Starting Alzheimer MRI Classifier API server...")
    app.run(host="127.0.0.1", port=8000, debug=False)