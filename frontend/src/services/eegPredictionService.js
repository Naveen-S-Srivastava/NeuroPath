// EEG Prediction Service for ChatBot
// Integrates with the Node.js backend EEG prediction endpoint

class EEGPredictionService {
  constructor() {
    this.baseUrl = null;
    this.apiKey = 'test-key'; // Default API key for testing
    this.isConnected = false;
  }

  // Initialize the service with backend URL
  initialize(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.isConnected = true;
    console.log('EEG Prediction Service initialized');
  }

  // Upload CSV file and get EEG predictions
  async predictFromCSV(file) {
    if (!this.isConnected) {
      throw new Error('EEG service not initialized. Please provide backend URL.');
    }

    if (!file) {
      throw new Error('No CSV file provided');
    }

    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      const response = await fetch(`${this.baseUrl}/api/eeg/predict`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error('EEG Prediction Error:', error);
      throw error;
    }
  }

  // Health check for the EEG endpoint
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      if (response.ok) {
        const data = await response.json();
        return data.status === 'OK';
      }
      return false;
    } catch (error) {
      console.error('EEG Health check error:', error);
      return false;
    }
  }

  // Get seizure class meanings
  getSeizureClassMeanings() {
    return {
      0: 'Normal EEG signal',
      1: 'Seizure activity detected (Class 1)',
      2: 'Seizure activity detected (Class 2)',
      3: 'Seizure activity detected (Class 3)',
      4: 'Seizure activity detected (Class 4)'
    };
  }

  // Format prediction results for display
  formatPredictionResults(results) {
    if (!results || !Array.isArray(results)) {
      return 'No prediction results available';
    }

    const meanings = this.getSeizureClassMeanings();
    const summary = results.slice(0, 5).map((result, index) => {
      return `Record ${index + 1}: ${meanings[result.prediction] || `Class ${result.prediction}`}`;
    }).join('\n');

    const seizureCount = results.filter(r => r.prediction > 0).length;
    const normalCount = results.filter(r => r.prediction === 0).length;

    return `EEG Analysis Results:\n\n${summary}\n\nSummary:\n- Normal signals: ${normalCount}\n- Seizure detections: ${seizureCount}\n- Total records analyzed: ${results.length}`;
  }
}

// Export the service
export default EEGPredictionService;