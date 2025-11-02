import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

# data psth
DATA_PATH = '../dataset/epileptic.csv'

# Robust check
if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f"Dataset not found! Looked at: {os.path.abspath(DATA_PATH)}")

# load dataset
df = pd.read_csv(DATA_PATH)
print("Dataset loaded successfully!")
print("Shape:", df.shape)
print("Columns:", df.columns)

# labeling
y = df['y'].values
print("Original label distribution:\n", pd.Series(y).value_counts())

# features
# Keep only numeric columns (drop non-numeric like 'Unnamed')
X = df.select_dtypes(include=['float64', 'int64']).drop(columns=['y']).values.astype('float32')

# Standardize features
scaler = StandardScaler()
X = scaler.fit_transform(X)
print("Feature standardization complete.")

# Reshape for 1D-CNN: (samples, channels, timepoints)
X = X.reshape(len(X), 1, X.shape[1])
print("Reshaped X shape:", X.shape)

# splitting
X_train, X_val, y_train, y_val = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)
print("Train/Validation split done.")
print("X_train:", X_train.shape, "y_train:", y_train.shape)
print("X_val:", X_val.shape, "y_val:", y_val.shape)

# preprocessed data
SAVE_DIR = '../dataset/'
os.makedirs(SAVE_DIR, exist_ok=True)

np.save(os.path.join(SAVE_DIR, 'X_train.npy'), X_train)
np.save(os.path.join(SAVE_DIR, 'y_train.npy'), y_train)
np.save(os.path.join(SAVE_DIR, 'X_val.npy'), X_val)
np.save(os.path.join(SAVE_DIR, 'y_val.npy'), y_val)
print(f"Preprocessed data saved in {os.path.abspath(SAVE_DIR)}")

# checks
print("\nSample X_train[0] (first 10 timepoints):", X_train[0][:, :10])
print("Sample y_train[0]:", y_train[0])

print("Unique labels in train set:", np.unique(y_train))
print("Unique labels in validation set:", np.unique(y_val))
