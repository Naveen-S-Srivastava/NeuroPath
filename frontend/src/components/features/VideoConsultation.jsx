import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useAuth } from '../context/AuthContext';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageSquare,
  Settings,
  Share,
  Users,
  Clock,
  Send,
  Maximize,
  Minimize,
  Volume2,
  VolumeX
} from 'lucide-react';
import { toast } from 'sonner';

export const VideoConsultation = ({ 
  onEndCall,
  participantType = 'patient',
  otherParticipant = {
    name: 'Dr. Sarah Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    role: 'Neurologist'
  }
}) => {
  const { user } = useAuth();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  const chatMessages = [
    {
      id: 1,
      sender: otherParticipant.name,
      message: 'Hello! How are you feeling today?',
      time: '10:30 AM',
      isDoctor: participantType === 'patient'
    },
    {
      id: 2,
      sender: user?.name || 'You',
      message: 'Hi Doctor, I\'ve been having some headaches.',
      time: '10:31 AM',
      isDoctor: participantType === 'doctor'
    }
  ];

  // Simulate call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Simulate connection status changes
    setTimeout(() => setConnectionStatus('connected'), 2000);

    return () => clearInterval(timer);
  }, []);

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    toast.success('Call ended successfully');
    onEndCall();
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      toast.success('Message sent');
      setChatMessage('');
    }
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    toast.info(isVideoOn ? 'Camera turned off' : 'Camera turned on');
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    toast.info(isAudioOn ? 'Microphone muted' : 'Microphone unmuted');
  };

  return (
    <div className={`min-h-screen bg-black relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500' :
                connectionStatus === 'poor' ? 'bg-orange-500' :
                'bg-red-500'
              }`}></div>
              <span className="text-sm capitalize">{connectionStatus}</span>
            </div>
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(callDuration)}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="relative h-screen flex">
        {/* Primary Video (Other Participant) */}
        <div className="flex-1 relative">
          {/* Simulated video background */}
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
            <div className="text-center text-white">
              <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-white">
                <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
                <AvatarFallback className="text-2xl">{otherParticipant.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-semibold mb-2">{otherParticipant.name}</h2>
              <p className="text-blue-200">{otherParticipant.role}</p>
              {!isVideoOn && (
                <Badge variant="secondary" className="mt-2">
                  <VideoOff className="h-3 w-3 mr-1" />
                  Camera Off
                </Badge>
              )}
            </div>
          </div>

          {/* Participant info overlay */}
          <div className="absolute bottom-4 left-4 text-white">
            <div className="bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm">
              <p className="font-medium">{otherParticipant.name}</p>
              <p className="text-sm text-gray-300">{otherParticipant.role}</p>
            </div>
          </div>
        </div>

        {/* Secondary Video (Self) */}
        <div className="absolute top-20 right-4 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20 z-10">
          <div className="w-full h-full bg-gradient-to-br from-teal-700 to-blue-700 flex items-center justify-center">
            <div className="text-center text-white">
              <Avatar className="h-16 w-16 mx-auto mb-2 border-2 border-white">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-blue-200">You</p>
              {!isVideoOn && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  <VideoOff className="h-2 w-2 mr-1" />
                  Off
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        {isChatOpen && (
          <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Chat</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsChatOpen(false)}
                >
                  ×
                </Button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.isDoctor === (participantType === 'doctor') ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.isDoctor === (participantType === 'doctor')
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.isDoctor === (participantType === 'doctor') ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <Input 
                  placeholder="Type a message..." 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-center space-x-4">
          {/* Audio Control */}
          <Button
            variant={isAudioOn ? "secondary" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full h-12 w-12 p-0"
          >
            {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          {/* Video Control */}
          <Button
            variant={isVideoOn ? "secondary" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full h-12 w-12 p-0"
          >
            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          {/* End Call */}
          <Button
            variant="destructive"
            size="lg"
            onClick={handleEndCall}
            className="rounded-full h-14 w-14 p-0 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>

          {/* Chat Toggle */}
          <Button
            variant={isChatOpen ? "default" : "secondary"}
            size="lg"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="rounded-full h-12 w-12 p-0"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          {/* Share Screen */}
          <Button
            variant="secondary"
            size="lg"
            onClick={() => toast.info('Screen sharing feature coming soon!')}
            className="rounded-full h-12 w-12 p-0"
          >
            <Share className="h-5 w-5" />
          </Button>
        </div>

        {/* Call Info */}
        <div className="text-center mt-4 text-white">
          <p className="text-sm">
            {participantType === 'patient' ? 'Consultation with' : 'Consulting with'} {otherParticipant.name}
          </p>
        </div>
      </div>

      {/* Connection Quality Indicator */}
      <div className="absolute top-20 left-4 z-20">
        <Card className="bg-black/50 border-white/20 text-white">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4].map((bar) => (
                  <div
                    key={bar}
                    className={`w-1 h-4 rounded ${
                      connectionStatus === 'connected' && bar <= 4 ? 'bg-green-500' :
                      connectionStatus === 'poor' && bar <= 2 ? 'bg-yellow-500' :
                      connectionStatus === 'connecting' && bar <= 3 ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`}
                  ></div>
                ))}
              </div>
              <span className="text-xs">{connectionStatus}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};