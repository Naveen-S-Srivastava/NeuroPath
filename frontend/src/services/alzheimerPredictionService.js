class AlzheimerPredictionService {
  constructor() {
    this.baseUrl = null;
    this.apiKey = null;
    this.isConnected = false;
  }

  initialize(apiKey, baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    console.log('AlzheimerPredictionService initialized with URL:', baseUrl);
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Alzheimer health check failed:', error);
      return false;
    }
  }

  async predictFromImage(imageFile) {
    if (!this.baseUrl) {
      throw new Error('Service not initialized. Call initialize() first.');
    }

    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Prediction failed:', error);
      throw error;
    }
  }

  formatPredictionResults(prediction) {
    const { prediction: predictedClass, meaning } = prediction;

    let severityColor = '';
    let severityIcon = '';

    switch (predictedClass) {
      case 'No Impairment':
        severityColor = '🟢';
        severityIcon = '✅';
        break;
      case 'Very Mild Impairment':
        severityColor = '🟡';
        severityIcon = '⚠️';
        break;
      case 'Mild Impairment':
        severityColor = '🟠';
        severityIcon = '⚠️';
        break;
      case 'Moderate Impairment':
        severityColor = '🔴';
        severityIcon = '🚨';
        break;
      default:
        severityColor = '⚪';
        severityIcon = '❓';
    }

    return `${severityIcon} **Alzheimer's Analysis Result:**\n\n` +
           `**Predicted Class:** ${predictedClass}\n` +
           `**Severity Level:** ${severityColor}\n\n` +
           `**Description:** ${meaning}\n\n` +
           `⚠️ *This is an AI-powered analysis and should not replace professional medical diagnosis. Please consult with a qualified neurologist for accurate assessment.*`;
  }
}

export default AlzheimerPredictionService;