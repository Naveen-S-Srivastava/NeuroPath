import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { useThemeToggle } from '../hooks/useTheme';
import FastAPIChatService from '../../services/fastAPIChatService';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  Loader2,
  Sparkles,
  Brain,
  Heart,
  Shield,
  Activity,
  Settings,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

const ChatBot = ({ isOpen, onToggle }) => {
  const { isDarkMode } = useThemeToggle();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [fastAPIService] = useState(new FastAPIChatService());
  const [useAI, setUseAI] = useState(false);
  const [aiConnected, setAiConnected] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Predefined responses for common queries
  const predefinedResponses = {
    greetings: [
      "Hello! I'm NeuroPath Assistant. How can I help you today?",
      "Hi there! I'm here to assist you with your neurological health queries.",
      "Welcome! I'm your AI assistant for NeuroPath. What would you like to know?"
    ],
    appointment: [
      "To book an appointment, go to the 'Book Appointment' section in your dashboard and select your preferred neurologist and time slot.",
      "You can schedule appointments through the appointment booking system. Choose your neurologist and available time slots.",
      "For appointments, use the booking system in your dashboard. You'll be able to see available neurologists and their schedules."
    ],
    prescription: [
      "Your prescriptions are available in the 'Prescriptions' section of your dashboard. You can view and download them there.",
      "To access your prescriptions, go to the prescriptions tab in your dashboard where you can view all your current medications.",
      "Prescriptions are stored in your dashboard under the prescriptions section. You can view, download, or request refills there."
    ],
    medicine: [
      "You can order medicines through the 'Medicine Orders' section. Upload your prescription and we'll help you get your medications delivered.",
      "For medicine orders, go to the medicine section in your dashboard, upload your prescription, and we'll process your order.",
      "Medicine ordering is available in your dashboard. Simply upload your prescription and we'll arrange delivery to your address."
    ],
    report: [
      "Your medical reports are stored in the 'Reports' section of your dashboard. You can view and download them anytime.",
      "To access your reports, go to the reports tab in your dashboard where all your medical documents are stored.",
      "Medical reports are available in the reports section of your dashboard. You can view, download, or share them as needed."
    ],
    emergency: [
      "For medical emergencies, please contact emergency services immediately (911) or go to the nearest emergency room.",
      "If this is a medical emergency, please call emergency services right away. This chatbot is not for emergency situations.",
      "For urgent medical issues, please seek immediate medical attention. Contact emergency services or visit the nearest hospital."
    ],
    general: [
      "I'm here to help with general questions about NeuroPath services. Feel free to ask about appointments, prescriptions, or any other queries.",
      "I can assist you with information about NeuroPath's services, including appointments, prescriptions, medicine orders, and reports.",
      "How can I help you today? I can provide information about our services and guide you through the platform."
    ]
  };

  // Keywords to match user queries
  const keywordMapping = {
    'hello|hi|hey|greetings': 'greetings',
    'appointment|book|schedule|meeting': 'appointment',
    'prescription|medication|medicine|drug': 'prescription',
    'order|buy|purchase|delivery': 'medicine',
    'report|test|result|document': 'report',
    'emergency|urgent|help|critical': 'emergency',
    'default': 'general'
  };

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: "Hello! I'm NeuroPath Assistant. How can I help you today?",
          sender: 'bot',
          timestamp: new Date(),
          type: 'welcome'
        }
      ]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize FastAPI service when component mounts
  useEffect(() => {
    // Check if API URL is available in localStorage
    const apiUrl = localStorage.getItem('neuropath_ai_api_url');
    if (apiUrl) {
      initializeAI(apiUrl);
    }
  }, []);

  const initializeAI = async (baseUrl = 'http://localhost:8000') => {
    try {
      console.log('Initializing AI with URL:', baseUrl);
      fastAPIService.initialize(null, baseUrl); // No API key needed for your friend's API
      
      console.log('Testing AI health...');
      const isHealthy = await fastAPIService.healthCheck();
      console.log('Health check result:', isHealthy);
      
      if (isHealthy) {
        setAiConnected(true);
        setUseAI(true);
        toast.success('AI Assistant connected!');
        console.log('AI successfully connected');
      } else {
        setAiConnected(false);
        setUseAI(false);
        toast.error('AI service unavailable - check if FastAPI server is running');
        console.log('AI health check failed');
      }
    } catch (error) {
      console.error('Failed to initialize AI:', error);
      setAiConnected(false);
      setUseAI(false);
      toast.error('Failed to connect to AI service: ' + error.message);
    }
  };

  const setAPIUrl = () => {
    const currentUrl = localStorage.getItem('neuropath_ai_api_url') || 'http://localhost:8000';
    const apiUrl = prompt('Enter your FastAPI URL:', currentUrl);
    if (apiUrl) {
      localStorage.setItem('neuropath_ai_api_url', apiUrl);
      initializeAI(apiUrl);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Find matching keyword
    for (const [keywords, responseType] of Object.entries(keywordMapping)) {
      if (keywords === 'default') continue;
      
      const keywordRegex = new RegExp(keywords, 'i');
      if (keywordRegex.test(message)) {
        const responses = predefinedResponses[responseType];
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
    
    // Default response
    const defaultResponses = predefinedResponses.general;
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      let botResponse;
      
      if (useAI && aiConnected) {
        // Use AI model for response
        botResponse = await fastAPIService.sendMessage(inputMessage, {
          sessionId,
          platform: 'NeuroPath',
          userRole: 'patient' // This could be dynamic based on current user
        });
      } else {
        // Use predefined responses
        botResponse = getBotResponse(inputMessage);
      }

      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        source: useAI && aiConnected ? 'ai' : 'predefined'
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      
      // Fallback to predefined response
      const fallbackResponse = getBotResponse(inputMessage);
      const botMessage = {
        id: Date.now() + 1,
        text: fallbackResponse,
        sender: 'bot',
        timestamp: new Date(),
        source: 'fallback'
      };

      setMessages(prev => [...prev, botMessage]);
      toast.error('AI service error, using fallback response');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm NeuroPath Assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'welcome'
      }
    ]);
    toast.success('Chat cleared');
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
        }`}
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-96 h-[600px] z-50 transition-all duration-300 ${
      isMinimized ? 'h-16' : 'h-[600px]'
    }`}>
      <Card className={`h-full flex flex-col shadow-2xl border-2 ${
        isDarkMode 
          ? 'bg-gray-900/95 border-white/10 backdrop-blur-xl' 
          : 'bg-white/95 border-gray-200 backdrop-blur-xl'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b ${
          isDarkMode ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <Bot className={`h-5 w-5 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h3 className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  NeuroPath Assistant
                </h3>
                <p className={`text-xs flex items-center space-x-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <span>AI-powered support</span>
                  {aiConnected ? (
                    <Zap className="h-3 w-3 text-green-500" title="AI Connected" />
                  ) : (
                    <Settings className="h-3 w-3 text-gray-400" title="AI Disconnected" />
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={setAPIUrl}
                className={`p-1 h-8 w-8 rounded-full ${
                  isDarkMode 
                    ? 'hover:bg-white/10 text-gray-400' 
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
                title="Configure AI URL"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className={`p-1 h-8 w-8 rounded-full ${
                  isDarkMode 
                    ? 'hover:bg-white/10 text-gray-400' 
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className={`p-1 h-8 w-8 rounded-full ${
                  isDarkMode 
                    ? 'hover:bg-white/10 text-gray-400' 
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                ×
              </Button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`p-2 rounded-full ${
                      message.sender === 'user' 
                        ? (isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100')
                        : (isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100')
                    }`}>
                      {message.sender === 'user' ? (
                        <User className={`h-4 w-4 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      ) : (
                        <Bot className={`h-4 w-4 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`} />
                      )}
                    </div>
                    <div className={`p-3 rounded-2xl ${
                      message.sender === 'user'
                        ? (isDarkMode 
                            ? 'bg-blue-500/20 border border-blue-400/30' 
                            : 'bg-blue-100 border border-blue-200')
                        : (isDarkMode 
                            ? 'bg-gray-800/50 border border-gray-700/50' 
                            : 'bg-gray-50 border border-gray-200')
                    }`}>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {message.text}
                      </p>
                      <p className={`text-xs mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className={`p-2 rounded-full ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                    }`}>
                      <Bot className={`h-4 w-4 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className={`p-3 rounded-2xl ${
                      isDarkMode 
                        ? 'bg-gray-800/50 border border-gray-700/50' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <div className="flex space-x-1">
                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                          isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                        }`} style={{ animationDelay: '0ms' }}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                          isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                        }`} style={{ animationDelay: '150ms' }}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                          isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                        }`} style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`p-4 border-t ${
              isDarkMode ? 'border-white/10' : 'border-gray-200'
            }`}>
              <div className="flex items-center space-x-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className={`flex-1 rounded-xl ${
                    isDarkMode 
                      ? 'border-white/20 bg-white/5 focus:border-white/40' 
                      : 'border-gray-300 bg-white focus:border-blue-500'
                  }`}
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className={`h-10 w-10 rounded-xl ${
                    !inputMessage.trim() || isTyping
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  }`}
                >
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Send className="h-4 w-4 text-white" />
                  )}
                </Button>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                {['Book Appointment', 'View Prescriptions', 'Order Medicine', 'Emergency'].map((action) => (
                  <Button
                    key={action}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInputMessage(action);
                      inputRef.current?.focus();
                    }}
                    className={`text-xs px-3 py-1 h-7 rounded-lg ${
                      isDarkMode
                        ? 'border-white/20 bg-white/5 hover:bg-white/10 text-white'
                        : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {action}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  className={`text-xs px-3 py-1 h-7 rounded-lg ${
                    isDarkMode
                      ? 'border-white/20 bg-white/5 hover:bg-white/10 text-white'
                      : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Clear Chat
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ChatBot;
