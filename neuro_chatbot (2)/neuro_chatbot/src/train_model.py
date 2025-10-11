import os
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print("Using device:", device)

#Load data
DATA_DIR = '../dataset/'

X_train = np.load(os.path.join(DATA_DIR, 'X_train.npy'))
y_train = np.load(os.path.join(DATA_DIR, 'y_train.npy'))
X_val = np.load(os.path.join(DATA_DIR, 'X_val.npy'))
y_val = np.load(os.path.join(DATA_DIR, 'y_val.npy'))

# Map labels 1-5 -> 0-4
y_train = y_train - 1
y_val = y_val - 1

#augmented data class
class EEGDataset(Dataset):
    def __init__(self, X, y, augment=False):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.long)
        self.augment = augment

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        x = self.X[idx]
        y = self.y[idx]

        if self.augment:
            x = self.time_shift(x)
            x = self.add_noise(x)

        return x, y

    def time_shift(self, x):
        shift = np.random.randint(-10, 10)
        return torch.roll(x, shifts=shift, dims=1)

    def add_noise(self, x):
        noise = 0.01 * torch.randn_like(x)
        return x + noise

# Dataloaders
batch_size = 64
train_dataset = EEGDataset(X_train, y_train, augment=True)
val_dataset = EEGDataset(X_val, y_val, augment=False)
train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

#Model definition
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

model = EEG_CNN_LSTM_Attention(num_classes=5).to(device)
print(model)

#Optimizer, Loss
# Compute class weights
class_counts = np.bincount(y_train)
class_counts = np.where(class_counts == 0, 1, class_counts)
weights = 1.0 / class_counts
weights = torch.tensor(weights, dtype=torch.float32).to(device)

criterion = nn.CrossEntropyLoss(weight=weights)
optimizer = optim.Adam(model.parameters(), lr=0.001)

#Training
num_epochs = 50
best_val_acc = 0
patience = 10
trigger_times = 0

for epoch in range(num_epochs):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for inputs, labels in train_loader:
        inputs, labels = inputs.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * inputs.size(0)
        _, predicted = torch.max(outputs, 1)
        correct += (predicted == labels).sum().item()
        total += labels.size(0)

    train_loss = running_loss / total
    train_acc = correct / total

    # Validation
    model.eval()
    val_correct = 0
    val_total = 0
    with torch.no_grad():
        for inputs, labels in val_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            _, predicted = torch.max(outputs, 1)
            val_correct += (predicted == labels).sum().item()
            val_total += labels.size(0)
    val_acc = val_correct / val_total

    print(f"Epoch [{epoch+1}/{num_epochs}] - Loss: {train_loss:.4f} - Train Acc: {train_acc:.4f} - Val Acc: {val_acc:.4f}")

    # Early stopping
    if val_acc > best_val_acc:
        best_val_acc = val_acc
        trigger_times = 0
        torch.save(model.state_dict(), os.path.join(DATA_DIR, 'best_eeg_model.pth'))
    else:
        trigger_times += 1
        if trigger_times >= patience:
            print("Early stopping triggered!")
            break

print(f"Training completed! Best Validation Accuracy: {best_val_acc:.4f}")
