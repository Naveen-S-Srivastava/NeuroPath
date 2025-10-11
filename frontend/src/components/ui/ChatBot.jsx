import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { useThemeToggle } from '../hooks/useTheme';
import FastAPIChatService from '../../services/fastAPIChatService';
import EEGPredictionService from '../../services/eegPredictionService';
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
  Zap,
  Upload,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

const ChatBot = ({ isOpen, onToggle }) => {
  const { isDarkMode } = useThemeToggle();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, _setIsMinimized] = useState(false);
  const [fastAPIService] = useState(new FastAPIChatService());
  const [eegService] = useState(new EEGPredictionService());
  const [useAI, setUseAI] = useState(false);
  const [aiConnected, setAiConnected] = useState(false);
  const [eegConnected, setEegConnected] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

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
    eeg: [
      "I can help you analyze EEG data! Upload a CSV file with your EEG signals and I'll provide seizure detection analysis.",
      "For EEG analysis, upload your CSV file containing EEG signal data. I'll use our AI model to detect potential seizure activity.",
      "EEG analysis is available! Simply upload your CSV file with EEG signals, and I'll process it to identify seizure patterns."
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
    'eeg|brain|seizure|epilepsy|analysis|signal': 'eeg',
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
  }, [messages.length]);

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

    // Initialize EEG service
    const backendUrl = localStorage.getItem('neuropath_backend_url') || 'http://localhost:5000';
    initializeEEG(backendUrl);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const initializeEEG = async (baseUrl = 'http://localhost:5000') => {
    try {
      console.log('Initializing EEG service with URL:', baseUrl);
      eegService.initialize(baseUrl);

      console.log('Testing EEG health...');
      const isHealthy = await eegService.healthCheck();
      console.log('EEG Health check result:', isHealthy);

      if (isHealthy) {
        setEegConnected(true);
        toast.success('EEG Analysis service connected!');
        console.log('EEG service successfully connected');
      } else {
        setEegConnected(false);
        toast.error('EEG service unavailable - check if backend server is running');
        console.log('EEG health check failed');
      }
    } catch (error) {
      console.error('Failed to initialize EEG service:', error);
      setEegConnected(false);
      toast.error('Failed to connect to EEG service: ' + error.message);
    }
  };

  const setBackendUrl = () => {
    const currentUrl = localStorage.getItem('neuropath_backend_url') || 'http://localhost:5000';
    const backendUrl = prompt('Enter your Backend URL:', currentUrl);
    if (backendUrl) {
      localStorage.setItem('neuropath_backend_url', backendUrl);
      initializeEEG(backendUrl);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const handleEEGUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a CSV file first');
      return;
    }

    if (!eegConnected) {
      toast.error('EEG service not connected. Please check backend URL.');
      return;
    }

    setIsTyping(true);

    try {
      const result = await eegService.predictFromCSV(selectedFile);
      const formattedResult = eegService.formatPredictionResults(result.results);

      const botMessage = {
        id: Date.now() + 1,
        text: formattedResult,
        sender: 'bot',
        timestamp: new Date(),
        source: 'eeg-analysis',
        type: 'eeg-result'
      };

      setMessages(prev => [...prev, botMessage]);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('EEG analysis error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: `Error analyzing EEG data: ${error.message}`,
        sender: 'bot',
        timestamp: new Date(),
        source: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
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

      // Check if user is asking for EEG analysis
      const message = inputMessage.toLowerCase();
      if (message.includes('eeg') || message.includes('brain') || message.includes('seizure') || message.includes('analysis')) {
        if (eegConnected) {
          botResponse = "I can help you analyze EEG data! Please upload a CSV file with your EEG signals, and I'll process it to detect seizure activity.";
        } else {
          botResponse = "EEG analysis service is currently unavailable. Please check that the backend server is running and try configuring the backend URL.";
        }
      } else if (useAI && aiConnected) {
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
                  {eegConnected ? (
                    <Brain className="h-3 w-3 text-blue-500 ml-1" title="EEG Analysis Connected" />
                  ) : (
                    <Brain className="h-3 w-3 text-gray-400 ml-1" title="EEG Analysis Disconnected" />
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
                onClick={setBackendUrl}
                className={`p-1 h-8 w-8 rounded-full ${
                  isDarkMode 
                    ? 'hover:bg-white/10 text-gray-400' 
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
                title="Configure Backend URL"
              >
                <Brain className="h-4 w-4" />
              </Button>
              {/* <Button
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
              </Button> */}
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
              {/* File Upload for EEG */}
              {eegConnected && (
                <div className="mb-3 p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedFile ? `Selected: ${selectedFile.name}` : 'Upload EEG CSV file for analysis'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="eeg-file-input"
                      />
                      <label
                        htmlFor="eeg-file-input"
                        className={`cursor-pointer px-3 py-1 text-xs rounded-md ${
                          isDarkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        <Upload className="h-3 w-3 inline mr-1" />
                        Browse
                      </label>
                      {selectedFile && (
                        <Button
                          onClick={handleEEGUpload}
                          disabled={isTyping}
                          size="sm"
                          className="h-7 px-3 text-xs bg-green-500 hover:bg-green-600"
                        >
                          <Brain className="h-3 w-3 mr-1" />
                          Analyze
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

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
                {['EEG Analysis'].map((action) => (
                  <Button
                    key={action}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (action === 'EEG Analysis') {
                        setInputMessage('I need EEG analysis');
                      } else {
                        setInputMessage(action);
                      }
                      inputRef.current?.focus();
                    }}
                    className={`text-xs px-3 py-1 h-7 rounded-lg ${
                      isDarkMode
                        ? 'border-white/20 bg-white/5 hover:bg-white/10 text-white'
                        : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {action === 'EEG Analysis' && <Brain className="h-3 w-3 mr-1" />}
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
