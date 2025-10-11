// FastAPI Integration Service for ChatBot
// Updated to work with your friend's FastAPI implementation

class FastAPIChatService {
  constructor() {
    this.apiKey = null;
    this.baseUrl = null;
    this.isConnected = false;
  }

  // Initialize the service with API credentials
  initialize(apiKey, baseUrl = 'http://localhost:5000') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.isConnected = true;
    console.log('FastAPI Chat Service initialized');
  }

  // Send message to the AI model (updated for your friend's API)
  async sendMessage(message, context = {}) {
    if (!this.isConnected) {
      throw new Error('FastAPI service not initialized. Please provide API key.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: Your friend's API doesn't require authorization header
          // but we'll keep it for future compatibility
        },
        body: JSON.stringify({
          user_message: message  // Updated to match your friend's API schema
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.reply; // Updated to match your friend's response format
    } catch (error) {
      console.error('FastAPI Chat Error:', error);
      throw error;
    }
  }

  // Health check (updated for your friend's API)
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Health check error:', error);
      return false;
    }
  }

  // Get conversation history (not implemented in your friend's API yet)
  async getConversationHistory(sessionId) {
    console.log('Conversation history not implemented in current API');
    return [];
  }

  // Clear conversation (not implemented in your friend's API yet)
  async clearConversation(sessionId) {
    console.log('Clear conversation not implemented in current API');
    return true;
  }
}

// Export the service
export default FastAPIChatService;
