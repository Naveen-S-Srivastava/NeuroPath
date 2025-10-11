from fastapi import FastAPI
from fastapi.responses import JSONResponse

eeg_app = FastAPI()

@eeg_app.get('/')
def root():
    return JSONResponse({'message': 'EEG API running'})

@eeg_app.post('/predict')
def predict():
    return JSONResponse({'message': 'Predict endpoint'})

print('App created with routes')