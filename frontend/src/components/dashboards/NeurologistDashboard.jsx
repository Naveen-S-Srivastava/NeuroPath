import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../context/AuthContext';
import { useThemeToggle } from '../hooks/useTheme';
import {
  Calendar,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Clock,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Send,
  Video,
  Phone,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  Stethoscope,
  Check,
  X,
  MessageCircle,
  Brain,
  Sparkles,
  LogOut,
  User,
  Settings,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { connectSocket, getSocket } from '../../lib/socket';

export const NeurologistDashboard = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeToggle();
  const [activeTab, setActiveTab] = useState('overview');
  const [particles, setParticles] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    appointments: [],
    patients: [],
    stats: {}
  });
  const [loading, setLoading] = useState(true);
  const [prescriptionForm, setPrescriptionForm] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const pcRef = React.useRef(null);
  const localStreamRef = React.useRef(null);
  const remoteVideoRef = React.useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callOffer, setCallOffer] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Set remote video stream when it becomes available
  React.useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const [showReportsModal, setShowReportsModal] = useState(false);
  const [patientReports, setPatientReports] = useState([]);
  const [chatMessagesState, setChatMessagesState] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [showCallModal, setShowCallModal] = useState(false);

  // Medicine orders management
  const [pendingOrders, setPendingOrders] = useState([]);
  const [approvedOrders, setApprovedOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierSelection, setSupplierSelection] = useState({});
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : 'http://localhost:5000';

  const fetchPendingOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem('neuropath_token');
      const res = await fetch(`${API_BASE}/api/medicine-orders/pending`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setPendingOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch pending orders', err);
    }
  }, [API_BASE]);

  const fetchApprovedOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem('neuropath_token');
      const res = await fetch(`${API_BASE}/api/medicine-orders/approved`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setApprovedOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch approved orders', err);
    }
  }, [API_BASE]);

  const fetchSuppliers = useCallback(async () => {
    try {
      const token = localStorage.getItem('neuropath_token');
      const res = await fetch(`${API_BASE}/api/suppliers`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setSuppliers(data.suppliers || []);
    } catch (err) {
      console.error('Failed to fetch suppliers', err);
    }
  }, [API_BASE]);

  const setSelectedSupplierForOrder = (orderId, supplierId) => {
    setSupplierSelection(prev => ({ ...prev, [orderId]: supplierId }));
  };

  const rejectOrder = useCallback(async (orderId) => {
    try {
      const token = localStorage.getItem('neuropath_token');
      const res = await fetch(`${API_BASE}/api/medicine-orders/${orderId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approve: false, note: 'Order rejected by neurologist' })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed');
      toast.success('Order rejected');
      await fetchPendingOrders();
    } catch (err) {
      console.error('Reject order failed', err);
      toast.error(err.message || 'Failed to reject order');
    }
  }, [API_BASE, fetchPendingOrders]);

  const forwardOrderToSupplier = useCallback(async (orderId) => {
    try {
      const supplierId = supplierSelection[orderId];
      if (!supplierId) return toast.error('Select a supplier first');
      const token = localStorage.getItem('neuropath_token');
      const res = await fetch(`${API_BASE}/api/medicine-orders/${orderId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approve: true, supplierId })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to forward');
      toast.success('Order forwarded to supplier');
      await fetchPendingOrders();
      await fetchApprovedOrders();
    } catch (err) {
      console.error('Forward order failed', err);
      toast.error(err.message || 'Failed to forward order');
    }
  }, [API_BASE, supplierSelection, fetchPendingOrders, fetchApprovedOrders]);

  useEffect(() => {
    // Create floating particles
    const createParticles = () => {
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 6 + Math.random() * 4,
      }));
      setParticles(newParticles);
    };
    
    createParticles();
    
    const token = localStorage.getItem('neuropath_token');
    let socket;
    try {
      socket = connectSocket(token);
      socket.on('appointment:request', (payload) => {
        setPendingRequests(prev => [payload.appointment, ...prev]);
        toast(() => (
          <div className="flex items-center">
            <div className="mr-2 font-medium">New appointment request</div>
            <div className="ml-2 text-sm text-gray-500">{payload.appointment.date} {payload.appointment.time}</div>
          </div>
        ));
      });

      socket.on('appointment:updated', (payload) => {
        setDashboardData(prev => ({
          ...prev,
          appointments: prev.appointments.map(a => a._id === (payload.appointment && payload.appointment._id) ? { ...a, status: payload.appointment.status } : a)
        }));
      });

      socket.on('chat:message', (payload) => {
        setChatMessagesState(prev => [...prev, payload]);
      });

      socket.on('webrtc:offer', async (payload) => {
        const { from, offer } = payload;
        setIncomingCall({ from, offer });
        setCallOffer(offer);
        toast.info('Incoming video call from patient');
      });

      socket.on('webrtc:answer', async (payload) => {
        const { answer } = payload;
        try {
          const pc = pcRef.current;
          if (pc) await pc.setRemoteDescription(answer);
        } catch (err) { console.error(err); }
      });

      socket.on('webrtc:ice', async (payload) => {
        const { candidate } = payload;
        try {
          const pc = pcRef.current;
          if (pc) await pc.addIceCandidate(candidate);
        } catch (err) { console.error(err); }
      });

      socket.on('webrtc:end', () => {
        toast.info('Call ended');
        endCall();
      });

    } catch (err) {
      console.warn('Socket init error', err);
    }

    // fetch initial data for medicine orders
    fetchPendingOrders();
    fetchApprovedOrders();
    fetchSuppliers();

    return () => {
      try {
        socket && socket.off('appointment:request');
        socket && socket.off('appointment:updated');
        socket && socket.off('chat:message');
        socket && socket.off('webrtc:offer');
        socket && socket.off('webrtc:answer');
        socket && socket.off('webrtc:ice');
      } catch (e) {
        console.warn('Socket init error', e);
      }
    };
  }, [fetchPendingOrders, fetchApprovedOrders, fetchSuppliers]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('neuropath_token');
      const response = await fetch('http://localhost:5000/api/dashboard/neurologist', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Use API data instead of mock data
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  const allAppointments = dashboardData.appointments || [];
  const todayAppointments = allAppointments.filter(appointment => appointment.date === todayStr);
  const pendingAppointments = allAppointments.filter(appointment => appointment.status === 'pending');
  const patients = dashboardData.patients || [];

  // Use API stats data
  const analytics = dashboardData.stats || {
    todayAppointments: 0
  };


  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      const token = localStorage.getItem('neuropath_token');

      if (action === 'confirmed' || action === 'rejected') {
        // Handle approve/reject for pending appointments
        const accept = action === 'confirmed';
        const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/respond`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accept }),
        });

        if (response.ok) {
          toast.success(`Appointment ${action === 'confirmed' ? 'approved' : 'rejected'} successfully!`);
          // Refresh dashboard data
          fetchDashboardData();
        } else {
          const error = await response.json().catch(() => ({}));
          toast.error(error.message || 'Failed to update appointment');
        }
      } else {
        // Handle other actions (started, rescheduled, etc.)
        toast.success(`Appointment ${action} successfully!`);
      }
    } catch (error) {
      console.error('Appointment action error:', error);
      toast.error('Failed to update appointment');
    }
  };

  const handleMessagePatient = (appointment) => {
    setSelectedAppointment(appointment);
    setActiveTab('chat');
    // Load messages for this appointment
    loadChatMessages(appointment._id || appointment.id);
    toast.success(`Switched to chat with ${appointment.patient}`);
  };

  const handleViewReports = async (appointment) => {
    setSelectedAppointment(appointment);
    setShowReportsModal(true);

    try {
      const token = localStorage.getItem('neuropath_token');
      const patientId = appointment.patientUserId || appointment.patientId;

      if (!patientId) {
        toast.error('Patient ID not found');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/reports/patient/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPatientReports(data.reports || []);
      } else {
        const error = await response.json().catch(() => ({}));
        toast.error(error.message || 'Failed to fetch reports');
        setPatientReports([]);
      }
    } catch (error) {
      console.error('Fetch reports error:', error);
      toast.error('Failed to fetch reports');
      setPatientReports([]);
    }
  };

  const handleGenerateNotes = async (appointment) => {
    // Find the patient from the appointment
    const patient = patients.find(p => p.name === appointment.patient);
    if (patient) {
      setSelectedPatient(patient);
      setSelectedAppointment(appointment);
      setShowPrescriptionModal(true);

      // Use prescriptions from dashboard data instead of fetching separately
      setPatientPrescriptions(patient.prescriptions || []);
    } else {
      toast.error('Patient information not found');
    }
  };

  const handlePrescriptionSubmit = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }

    if (!prescriptionForm.medication) {
      toast.error('Please enter medication name');
      return;
    }

    try {
      const token = localStorage.getItem('neuropath_token');
      const response = await fetch(`${API_BASE}/api/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: selectedPatient._id || selectedPatient.id,
          appointmentId: selectedAppointment?._id || selectedAppointment?.id,
          medication: prescriptionForm.medication,
          duration: prescriptionForm.duration,
          instructions: prescriptionForm.instructions
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create prescription');
      }

      toast.success('Prescription created successfully!');

      // Reset form
      setPrescriptionForm({
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      });

      // Close modal
      setShowPrescriptionModal(false);

      // Refresh dashboard data to update patient info
      fetchDashboardData();
    } catch (error) {
      console.error('Prescription submit error:', error);
      toast.error(error.message || 'Failed to create prescription');
    }
  };  const startCall = async () => {
    if (!selectedAppointment) return toast.error('Please select a patient first');
    const target = selectedAppointment.patientUserId || selectedAppointment.patientId || selectedAppointment.patient?._id;
    if (!target) return toast.error('No patient information available for this call');

    try {
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      localStreamRef.current = localStream;
      localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

      pc.ontrack = (e) => {
        const [stream] = e.streams;
        setRemoteStream(stream);
        setCallActive(true);
        setShowCallModal(true);
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          const socket = connectSocket(localStorage.getItem('neuropath_token'));
          socket.emit('webrtc:ice', { to: target, candidate: e.candidate });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const socket = connectSocket(localStorage.getItem('neuropath_token'));
      socket.emit('webrtc:offer', { to: target, offer });
      toast.success('Calling patient...');
    } catch (err) {
      console.error('Start call failed', err);
      toast.error('Failed to start call: ' + err.message);
    }
  };

  const endCall = () => {
    try {
      if (pcRef.current) {
        pcRef.current.onicecandidate = null;
        pcRef.current.ontrack = null;
        pcRef.current.close();
        pcRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
    } catch (e) {
      console.warn('Socket cleanup error', e);
    }
    setCallActive(false);
    setShowCallModal(false);
  };

  const acceptCall = async () => {
    if (!incomingCall || !callOffer) return;

    try {
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      pc.ontrack = (e) => {
        const [stream] = e.streams;
        setRemoteStream(stream);
        setCallActive(true);
        setShowCallModal(true);
      };

      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      localStreamRef.current = localStream;
      localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          const socket = connectSocket(localStorage.getItem('neuropath_token'));
          socket.emit('webrtc:ice', { to: incomingCall.from, candidate: e.candidate });
        }
      };

      await pc.setRemoteDescription(callOffer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const socket = connectSocket(localStorage.getItem('neuropath_token'));
      socket.emit('webrtc:answer', { to: incomingCall.from, answer });

      setIncomingCall(null);
      setCallOffer(null);
      toast.success('Call connected');
    } catch (err) {
      console.error('Accept call failed', err);
      toast.error('Failed to accept call');
      setIncomingCall(null);
      setCallOffer(null);
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      const socket = connectSocket(localStorage.getItem('neuropath_token'));
      socket.emit('webrtc:reject', { to: incomingCall.from });
      setIncomingCall(null);
      setCallOffer(null);
      toast.info('Call rejected');
    }
  };

  const loadChatMessages = async (appointmentId) => {
    try {
      const token = localStorage.getItem('neuropath_token');
      const response = await fetch(`${API_BASE}/api/appointments/${appointmentId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessagesState(data.messages || []);
      } else {
        console.error('Failed to load messages');
        setChatMessagesState([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setChatMessagesState([]);
    }
  };
  const sendChatMessage = async () => {
    let appointmentId = selectedAppointment ? (selectedAppointment._id || selectedAppointment.id) : null;
    if (!appointmentId) {
      // Fallback to first appointment if none selected
      const appt = (todayAppointments || [])[0];
      appointmentId = appt && (appt._id || appt.id);
    }
    if (!appointmentId) return toast.error('Select an appointment to message');
    if (!chatInput.trim()) return;
    try {
      const token = localStorage.getItem('neuropath_token');
      const res = await fetch(`${API_BASE}/api/appointments/${appointmentId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: chatInput.trim() })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to send');
      setChatMessagesState(prev => [...prev, { message: data.message }]);
      setChatInput('');
    } catch (err) {
      console.error('Send message failed', err);
      toast.error(err.message || 'Failed to send');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Morphing Orbs */}
        <div className={`absolute top-20 left-20 w-32 h-32 rounded-full animate-morph opacity-20 ${
          isDarkMode ? 'bg-white' : 'bg-blue-200'
        }`}></div>
        <div className={`absolute top-40 right-32 w-24 h-24 rounded-full animate-morph opacity-30 ${
          isDarkMode ? 'bg-gray-300' : 'bg-indigo-200'
        }`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute bottom-32 left-1/3 w-28 h-28 rounded-full animate-morph opacity-25 ${
          isDarkMode ? 'bg-gray-200' : 'bg-slate-200'
        }`} style={{ animationDelay: '4s' }}></div>
        
        {/* Floating Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute w-2 h-2 rounded-full animate-float-slow ${
              isDarkMode ? 'bg-white' : 'bg-blue-300'
            }`}
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
        
        {/* Glow Effects */}
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full animate-glow-pulse opacity-10 ${
          isDarkMode ? 'bg-white' : 'bg-blue-200'
        }`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full animate-glow-pulse opacity-15 ${
          isDarkMode ? 'bg-gray-300' : 'bg-indigo-200'
        }`} style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 animate-slide-in-blur">
            <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div 
                className={`flex items-center space-x-2 cursor-pointer transition-all duration-300 hover:scale-105 px-4 py-2 rounded-xl border-2 shadow-lg hover:shadow-xl backdrop-blur-md ${
                  isDarkMode 
                    ? 'text-white border-white/30 bg-white/10 hover:bg-white/20 hover:border-white/50' 
                    : 'text-gray-800 border-white/30 bg-white/20 hover:bg-white/30 hover:border-white/40'
                }`}
                onClick={() => window.location.href = '/'}
              >
                <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-md'
                }`}>
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <span className={`text-lg font-bold transition-all duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  NeuroPath
                </span>
              </div>
              <div>
                <h1 className={`text-3xl font-bold bg-gradient-to-r ${
                  isDarkMode 
                    ? 'from-white to-gray-300' 
                    : 'from-gray-900 to-gray-700'
                } bg-clip-text text-transparent`}>
            Namaste, Dr. {user?.name}!
                </h1>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
            You have {analytics.appointmentsToday} appointments today
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleTheme}
                className={`px-4 py-2 rounded-xl border backdrop-blur-md transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'border-white/20 bg-white/10 hover:bg-white/20 text-white' 
                    : 'border-gray-300 bg-white/80 hover:bg-white hover:border-gray-400 text-gray-700 shadow-sm hover:shadow-md'
                }`}
              >
                <Settings className="h-4 w-4 mr-2" />
                Theme
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className={`px-4 py-2 rounded-xl border backdrop-blur-md transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'border-white/20 bg-white/10 hover:bg-white/20 text-white' 
                    : 'border-gray-300 bg-white/80 hover:bg-white hover:border-gray-400 text-gray-700 shadow-sm hover:shadow-md'
                }`}
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setActiveTab('prescriptions')}
                className={`px-4 py-2 rounded-xl border backdrop-blur-md transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'border-white/20 bg-white/10 hover:bg-white/20 text-white' 
                    : 'border-gray-300 bg-white/80 hover:bg-white hover:border-gray-400 text-gray-700 shadow-sm hover:shadow-md'
                }`}
              >
            <Plus className="h-4 w-4 mr-2" />
            Create Prescription
                </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {/* Navigate to profile page */}}
                className={`px-4 py-2 rounded-xl border backdrop-blur-md transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'border-white/20 bg-white/10 hover:bg-white/20 text-white' 
                    : 'border-gray-300 bg-white/80 hover:bg-white hover:border-gray-400 text-gray-700 shadow-sm hover:shadow-md'
                }`}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={logout}
                className={`px-4 py-2 rounded-xl border backdrop-blur-md transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'border-red-400/30 bg-red-400/10 hover:bg-red-400/20 text-red-400 hover:text-red-300' 
                    : 'border-red-300 bg-red-50 hover:bg-red-100 hover:border-red-400 text-red-600 hover:text-red-700 shadow-sm hover:shadow-md'
                }`}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              </div>
            </div>

            {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="mb-6 animate-slide-in-blur">
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Pending Appointment Requests</h3>
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div 
                    key={req._id} 
                    className={`p-4 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                        : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{req.doctor} • {req.date} {req.time}</div>
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>Type: {req.type}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          className="bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-105" 
                          onClick={() => {
                          const socket = getSocket();
                          socket && socket.emit('appointment:respond', { appointmentId: req._id, accept: true });
                          setPendingRequests(prev => prev.filter(p => p._id !== req._id));
                          }}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-red-300 text-red-600 hover:bg-red-50 transition-all duration-300 hover:scale-105"
                          onClick={() => {
                          const socket = getSocket();
                          socket && socket.emit('appointment:respond', { appointmentId: req._id, accept: false });
                          setPendingRequests(prev => prev.filter(p => p._id !== req._id));
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Call UI Components */}
        {/* Incoming Call Notification */}
        {incomingCall && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                  <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Incoming Video Call</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Patient is calling you</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={rejectCall}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={acceptCall}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Accept
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full grid-cols-4 backdrop-blur-md border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-white/10 border-white/20' 
              : 'bg-white/20 border-white/30'
          }`}>
            <TabsTrigger 
              value="overview"
              className={`transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'data-[state=active]:bg-white/20 data-[state=active]:text-white hover:bg-white/10' 
                  : 'data-[state=active]:bg-blue-500 data-[state=active]:text-white hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="appointments"
              className={`transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'data-[state=active]:bg-white/20 data-[state=active]:text-white hover:bg-white/10' 
                  : 'data-[state=active]:bg-blue-500 data-[state=active]:text-white hover:bg-gray-100'
              }`}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger 
              value="patients"
              className={`transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'data-[state=active]:bg-white/20 data-[state=active]:text-white hover:bg-white/10' 
                  : 'data-[state=active]:bg-blue-500 data-[state=active]:text-white hover:bg-gray-100'
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              Patient Records
            </TabsTrigger>
            <TabsTrigger 
              value="medicine"
              className={`transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'data-[state=active]:bg-white/20 data-[state=active]:text-white hover:bg-white/10' 
                  : 'data-[state=active]:bg-blue-500 data-[state=active]:text-white hover:bg-gray-100'
              }`}
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Medicines
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
             <div className="grid lg:grid-cols-3 gap-6">
               {/* Left Column - Pending Appointments */}
               <div className="lg:col-span-2 space-y-6">
                {/* Pending Appointments */}
                {pendingAppointments.length > 0 && (
                   <div>
                     <div className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
                       isDarkMode 
                         ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                         : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
                     }`}>
                       <div className="mb-6">
                         <div className="flex items-center justify-between">
                           <h3 className={`text-lg font-semibold ${
                             isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>
                          Pending Appointment Requests
                           </h3>
                          <Badge variant="secondary">{pendingAppointments.length}</Badge>
                         </div>
                       </div>
                       <div className="space-y-4">
                        {pendingAppointments.map((appointment) => (
                          <div key={appointment._id || appointment.id} className="flex items-center space-x-4 p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={appointment.avatar} alt={appointment.patient} />
                              <AvatarFallback>{appointment.patient.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {appointment.patient}
                                </h4>
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                  Pending Approval
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.reason}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {appointment.date}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {appointment.time}
                                </span>
                                <span>{appointment.type}</span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-24 bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
                                onClick={() => handleAppointmentAction(appointment._id || appointment.id, 'confirmed')}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-24 bg-red-50 hover:bg-red-100 border-red-300 text-red-700"
                                onClick={() => handleAppointmentAction(appointment._id || appointment.id, 'rejected')}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                       </div>
                     </div>
                  </div>
                )}

                {/* Today's Schedule */}
                 <div>
                   <div className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
                     isDarkMode 
                       ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                       : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
                   }`}>
                     <div className="mb-6">
                       <div className="flex items-center justify-between">
                         <h3 className={`text-lg font-semibold ${
                           isDarkMode ? 'text-white' : 'text-gray-900'
                         }`}>
                        Today's Schedule
                         </h3>
                         <Button 
                           variant="outline" 
                           size="sm" 
                           onClick={() => setActiveTab('appointments')}
                           className={`transition-all duration-300 hover:scale-105 ${
                             isDarkMode 
                               ? 'border-white/30 bg-white/10 hover:bg-white/20 text-white' 
                               : 'border-gray-300 bg-white/80 hover:bg-white hover:border-gray-400 text-gray-700'
                           }`}
                         >
                          View All
                        </Button>
                       </div>
                     </div>
                     <div className="space-y-4">
                      {todayAppointments.map((appointment) => (
                        <div key={appointment._id || appointment.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={appointment.avatar} alt={appointment.patient} />
                            <AvatarFallback>{appointment.patient.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {appointment.patient}
                              </h4>
                              <Badge variant={appointment.status === 'completed' ? 'default' : 'secondary'}>
                                {appointment.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.reason}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {appointment.time}
                              </span>
                              <span>{appointment.type}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {appointment.status === 'upcoming' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAppointmentAction(appointment._id || appointment.id, 'started')}
                                >
                                  <Video className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAppointmentAction(appointment._id || appointment.id, 'rescheduled')}
                                >
                                  <Calendar className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                     </div>
                </div>
              </div>

                 {/* Recent Activity */}
                 <div className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
                   isDarkMode 
                     ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                     : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
                 }`}>
                   <div className="mb-6">
                     <h3 className={`text-lg font-semibold ${
                       isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>
                       Recent Activity
                     </h3>
                   </div>
                   <div className="space-y-4">
                     <div className={`p-4 rounded-xl border transition-all duration-300 ${
                       isDarkMode 
                         ? 'bg-white/5 border-white/20 hover:bg-white/10' 
                         : 'bg-white/10 border-gray-200 hover:bg-white/20'
                     }`}>
                       <div className="flex items-center space-x-3">
                         <div className={`p-2 rounded-lg ${
                           isDarkMode ? 'bg-blue-400/20' : 'bg-blue-100'
                         }`}>
                           <FileText className={`h-4 w-4 ${
                             isDarkMode ? 'text-blue-400' : 'text-blue-600'
                           }`} />
                         </div>
                         <div>
                           <p className={`text-sm font-medium ${
                             isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>Prescription Created</p>
                           <p className={`text-xs ${
                             isDarkMode ? 'text-gray-400' : 'text-gray-500'
                           }`}>2 hours ago</p>
                         </div>
                       </div>
                     </div>
                     <div className={`p-4 rounded-xl border transition-all duration-300 ${
                       isDarkMode 
                         ? 'bg-white/5 border-white/20 hover:bg-white/10' 
                         : 'bg-white/10 border-gray-200 hover:bg-white/20'
                     }`}>
                       <div className="flex items-center space-x-3">
                         <div className={`p-2 rounded-lg ${
                           isDarkMode ? 'bg-green-400/20' : 'bg-green-100'
                         }`}>
                           <MessageCircle className={`h-4 w-4 ${
                             isDarkMode ? 'text-green-400' : 'text-green-600'
                           }`} />
                         </div>
                         <div>
                           <p className={`text-sm font-medium ${
                             isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>Patient Message</p>
                           <p className={`text-xs ${
                             isDarkMode ? 'text-gray-400' : 'text-gray-500'
                           }`}>4 hours ago</p>
                         </div>
                       </div>
                     </div>
                     <div className={`p-4 rounded-xl border transition-all duration-300 ${
                       isDarkMode 
                         ? 'bg-white/5 border-white/20 hover:bg-white/10' 
                         : 'bg-white/10 border-gray-200 hover:bg-white/20'
                     }`}>
                       <div className="flex items-center space-x-3">
                         <div className={`p-2 rounded-lg ${
                           isDarkMode ? 'bg-purple-400/20' : 'bg-purple-100'
                         }`}>
                           <Eye className={`h-4 w-4 ${
                             isDarkMode ? 'text-purple-400' : 'text-purple-600'
                           }`} />
                         </div>
                         <div>
                           <p className={`text-sm font-medium ${
                             isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>Report Reviewed</p>
                           <p className={`text-xs ${
                             isDarkMode ? 'text-gray-400' : 'text-gray-500'
                           }`}>6 hours ago</p>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Right Column - Quick Actions & Stats */}
              <div className="space-y-6">
                 <div className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
                   isDarkMode 
                     ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                     : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
                 }`}>
                   <div className="mb-6">
                     <h3 className={`text-lg font-semibold ${
                       isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>
                       Quick Actions
                     </h3>
                   </div>
                   <div className="space-y-3">
                     <Button 
                       className={`w-full justify-start transition-all duration-300 hover:scale-105 ${
                         isDarkMode 
                           ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                           : 'bg-blue-600 hover:bg-blue-700 text-white'
                       }`}
                     >
                      <Plus className="h-4 w-4 mr-2" />
                      New Prescription
                    </Button>
                     <Button 
                       variant="outline" 
                       className={`w-full justify-start transition-all duration-300 hover:scale-105 ${
                         isDarkMode 
                           ? 'border-white/30 bg-white/10 hover:bg-white/20 text-white' 
                           : 'border-gray-300 bg-white/80 hover:bg-white hover:border-gray-400 text-gray-700'
                       }`}
                     >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message Patient
                    </Button>
                     <Button 
                       variant="outline" 
                       className={`w-full justify-start transition-all duration-300 hover:scale-105 ${
                         isDarkMode 
                           ? 'border-white/30 bg-white/10 hover:bg-white/20 text-white' 
                           : 'border-gray-300 bg-white/80 hover:bg-white hover:border-gray-400 text-gray-700'
                       }`}
                     >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                     <Button 
                       variant="outline" 
                       className={`w-full justify-start transition-all duration-300 hover:scale-105 ${
                         isDarkMode 
                           ? 'border-white/30 bg-white/10 hover:bg-white/20 text-white' 
                           : 'border-gray-300 bg-white/80 hover:bg-white hover:border-gray-400 text-gray-700'
                       }`}
                     >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                   </div>
                 </div>

                 {/* Today's Stats */}
                 <div className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
                   isDarkMode 
                     ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                     : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
                 }`}>
                   <div className="mb-6">
                     <h3 className={`text-lg font-semibold ${
                       isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>
                       Today's Stats
                     </h3>
                   </div>
                   <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-3">
                         <div className={`p-2 rounded-lg ${
                           isDarkMode ? 'bg-blue-400/20' : 'bg-blue-100'
                         }`}>
                           <Calendar className={`h-4 w-4 ${
                             isDarkMode ? 'text-blue-400' : 'text-blue-600'
                           }`} />
                         </div>
                         <span className={`text-sm ${
                           isDarkMode ? 'text-gray-300' : 'text-gray-600'
                         }`}>Appointments</span>
                       </div>
                       <span className={`font-semibold ${
                         isDarkMode ? 'text-white' : 'text-gray-900'
                       }`}>{todayAppointments.length}</span>
                     </div>
                     <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-3">
                         <div className={`p-2 rounded-lg ${
                           isDarkMode ? 'bg-green-400/20' : 'bg-green-100'
                         }`}>
                           <CheckCircle className={`h-4 w-4 ${
                             isDarkMode ? 'text-green-400' : 'text-green-600'
                           }`} />
                         </div>
                         <span className={`text-sm ${
                           isDarkMode ? 'text-gray-300' : 'text-gray-600'
                         }`}>Completed</span>
                       </div>
                       <span className={`font-semibold ${
                         isDarkMode ? 'text-white' : 'text-gray-900'
                       }`}>{todayAppointments.filter(a => a.status === 'completed').length}</span>
                     </div>
                     <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-3">
                         <div className={`p-2 rounded-lg ${
                           isDarkMode ? 'bg-yellow-400/20' : 'bg-yellow-100'
                         }`}>
                           <Clock className={`h-4 w-4 ${
                             isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                           }`} />
                         </div>
                         <span className={`text-sm ${
                           isDarkMode ? 'text-gray-300' : 'text-gray-600'
                         }`}>Pending</span>
                       </div>
                       <span className={`font-semibold ${
                         isDarkMode ? 'text-white' : 'text-gray-900'
                       }`}>{pendingAppointments.length}</span>
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appointment Calendar</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input placeholder="Search appointments..." className="pl-10 w-64" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid gap-6">
              {/* {allAppointments.map((appointment) => ( */}
                 {allAppointments.filter(appointment => appointment.status === 'confirmed').map((appointment) => (
                
                <div 
                  key={appointment._id || appointment.id} 
                  className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
                    isDarkMode 
                      ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                      : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
                  }`}
                >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={appointment.avatar} alt={appointment.patient} />
                        <AvatarFallback>{appointment.patient.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {appointment.patient}
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Time:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{appointment.time}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Type:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{appointment.type}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Reason:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{appointment.reason}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Age:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{appointment.age}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                         <Button 
                           variant="outline" 
                           size="sm" 
                           onClick={() => handleMessagePatient(appointment)}
                           className={`transition-all duration-300 hover:scale-105 ${
                             isDarkMode 
                               ? 'border-blue-400/30 bg-blue-400/10 hover:bg-blue-400/20 hover:border-blue-400/50 text-blue-400 hover:text-blue-300' 
                               : 'border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 text-blue-600 hover:text-blue-700'
                           }`}
                         >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Message 
                            </Button>
                         <Button 
                           variant="outline" 
                           size="sm" 
                           onClick={() => handleViewReports(appointment)}
                           className={`transition-all duration-300 hover:scale-105 ${
                             isDarkMode 
                               ? 'border-green-400/30 bg-green-400/10 hover:bg-green-400/20 hover:border-green-400/50 text-green-400 hover:text-green-300' 
                               : 'border-green-300 bg-green-50 hover:bg-green-100 hover:border-green-400 text-green-600 hover:text-green-700'
                           }`}
                         >
                              <Eye className="h-4 w-4 mr-2" />
                              View Report
                            </Button>
                         <Button 
                           variant="outline" 
                           size="sm" 
                           onClick={() => handleGenerateNotes(appointment)}
                           className={`transition-all duration-300 hover:scale-105 ${
                             isDarkMode 
                               ? 'border-purple-400/30 bg-purple-400/10 hover:bg-purple-400/20 hover:border-purple-400/50 text-purple-400 hover:text-purple-300' 
                               : 'border-purple-300 bg-purple-50 hover:bg-purple-100 hover:border-purple-400 text-purple-600 hover:text-purple-700'
                           }`}
                         >
                              <FileText className="h-4 w-4 mr-2" />
                              Prescription
                            </Button>
                      </div>
                    </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <div className="flex items-center justify-between">
               <h2 className={`text-2xl font-bold bg-gradient-to-r ${
                 isDarkMode 
                   ? 'from-white to-gray-300' 
                   : 'from-gray-900 to-gray-700'
               } bg-clip-text text-transparent`}>My Patients</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                   <Input 
                     placeholder="Search patients..." 
                     className={`pl-10 w-64 rounded-lg border backdrop-blur-sm ${
                       isDarkMode 
                         ? 'border-white/30 bg-white/20 hover:bg-white/30 text-white placeholder-gray-400' 
                         : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-900 placeholder-gray-500'
                     }`} 
                   />
                </div>
                 <Button 
                   variant="outline" 
                   size="sm"
                   className={`transition-all duration-300 hover:scale-105 ${
                     isDarkMode 
                       ? 'border-white/30 bg-white/10 hover:bg-white/20 text-white' 
                       : 'border-gray-300 bg-white/80 hover:bg-white hover:border-gray-400 text-gray-700'
                   }`}
                 >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

             <div className="grid lg:grid-cols-4 gap-6">
              {/* Patient List */}
              <div className="lg:col-span-1 space-y-4">
                 <div className={`p-4 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
                   isDarkMode 
                     ? 'bg-white/10 border-white/20' 
                     : 'bg-white/20 border-white/30'
                 }`}>
                   <h3 className={`text-lg font-semibold mb-4 ${
                     isDarkMode ? 'text-white' : 'text-gray-900'
                   }`}>
                     Patient List ({patients.length})
                   </h3>
                   <div className="space-y-3 max-h-96 overflow-y-auto">
                {patients.map((patient) => (
                       <div
                    key={patient._id || patient.id}
                         className={`p-3 rounded-xl border transition-all duration-300 hover:shadow-lg cursor-pointer ${
                           isDarkMode 
                             ? 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30' 
                             : 'bg-white/10 border-gray-200 hover:bg-white/20 hover:border-gray-300'
                         } ${(selectedPatient?._id || selectedPatient?.id) === (patient._id || patient.id) ? (isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200') : ''
                      }`}
                    onClick={() => setSelectedPatient(patient)}
                  >
                      <div className="flex items-center space-x-3">
                           <Avatar className="h-10 w-10">
                          <AvatarImage src={patient.avatar} alt={patient.name} />
                          <AvatarFallback>{patient.name ? patient.name.charAt(0) : ''}</AvatarFallback>
                        </Avatar>
                           <div className="flex-1 min-w-0">
                             <h3 className={`font-semibold text-sm truncate ${
                               isDarkMode ? 'text-white' : 'text-gray-900'
                             }`}>
                            {patient.name}
                          </h3>
                             <p className={`text-xs truncate ${
                               isDarkMode ? 'text-gray-400' : 'text-gray-500'
                             }`}>
                               {patient.email || 'No email'}
                             </p>
                        </div>
                      </div>
                       </div>
                ))}
                   </div>
                 </div>
              </div>

              {/* Patient Details */}
               <div className="lg:col-span-3">
                {selectedPatient ? (
                  <div className="space-y-6">
                    {/* Patient Basic Info */}
                     <div className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
                       isDarkMode 
                         ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                         : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
                     }`}>
                       <div className="flex items-center space-x-4 mb-6">
                         <Avatar className="h-20 w-20">
                            <AvatarImage src={selectedPatient.avatar} alt={selectedPatient.name} />
                            <AvatarFallback>{selectedPatient.name ? selectedPatient.name.charAt(0) : ''}</AvatarFallback>
                          </Avatar>
                          <div>
                           <h3 className={`text-3xl font-bold ${
                             isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>{selectedPatient.name.toUpperCase()}</h3>
                           <p className={`text-sm ${
                             isDarkMode ? 'text-gray-300' : 'text-gray-600'
                           }`}>
                             Patient ID: {selectedPatient._id || selectedPatient.id}
                           </p>
                          </div>
                        </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Contact Information */}
                        <div>
                           <h4 className={`font-semibold mb-3 ${
                             isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>Contact Information</h4>
                           <div className="space-y-2 text-sm">
                             <div className="flex items-center space-x-2">
                               <span className={`w-16 ${
                                 isDarkMode ? 'text-gray-400' : 'text-gray-600'
                               }`}>Phone:</span>
                               <span className={`${
                                 isDarkMode ? 'text-white' : 'text-gray-900'
                               }`}>{selectedPatient.phone || 'Not provided'}</span>
                            </div>
                             <div className="flex items-center space-x-2">
                               <span className={`w-16 ${
                                 isDarkMode ? 'text-gray-400' : 'text-gray-600'
                               }`}>Email:</span>
                               <span className={`${
                                 isDarkMode ? 'text-white' : 'text-gray-900'
                               }`}>{selectedPatient.email || 'Not provided'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Medical History */}
                        <div>
                           <h4 className={`font-semibold mb-3 ${
                             isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>Medical History</h4>
                           <div className="space-y-1">
                             {(selectedPatient.medicalHistory || []).length > 0 ? (
                               <ul className={`list-disc list-inside space-y-1 text-sm ${
                                 isDarkMode ? 'text-gray-300' : 'text-gray-600'
                               }`}>
                            {(selectedPatient.medicalHistory || []).map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                             ) : (
                               <p className={`text-sm ${
                                 isDarkMode ? 'text-gray-400' : 'text-gray-500'
                               }`}>No medical history recorded</p>
                             )}
                           </div>
                         </div>
                        </div>

                        {/* Current Medications */}
                       <div className="mt-6">
                         <h4 className={`font-semibold mb-3 ${
                           isDarkMode ? 'text-white' : 'text-gray-900'
                         }`}>Current Medications</h4>
                         <div className="flex flex-wrap gap-2">
                           {(selectedPatient.currentMedications || []).length > 0 ? (
                             (selectedPatient.currentMedications || []).map((medication, index) => (
                               <Badge key={index} variant="outline" className={`${
                                 isDarkMode 
                                   ? 'border-white/30 text-white' 
                                   : 'border-gray-300 text-gray-700'
                               }`}>
                                {medication}
                              </Badge>
                             ))
                           ) : (
                             <p className={`text-sm ${
                               isDarkMode ? 'text-gray-400' : 'text-gray-500'
                             }`}>No current medications</p>
                           )}
                          </div>
                        </div>
                     </div>

                     <div className="grid lg:grid-cols-2 gap-6">
                    {/* Appointment History */}
                       <div className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
                         isDarkMode 
                           ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                           : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
                       }`}>
                         <div className="mb-6">
                           <div className="flex items-center justify-between">
                             <h3 className={`text-lg font-semibold ${
                               isDarkMode ? 'text-white' : 'text-gray-900'
                             }`}>
                          Appointment History
                             </h3>
                          <Badge variant="secondary">
                            {(selectedPatient.appointmentHistory || []).length} appointments
                          </Badge>
                           </div>
                         </div>
                         <div className="space-y-3 max-h-64 overflow-y-auto">
                        {selectedPatient.appointmentHistory && selectedPatient.appointmentHistory.length > 0 ? (
                             selectedPatient.appointmentHistory.map((appointment) => (
                               <div key={appointment._id} className={`p-3 rounded-lg border transition-all duration-300 ${
                                 isDarkMode 
                                   ? 'bg-white/5 border-white/20 hover:bg-white/10' 
                                   : 'bg-white/10 border-gray-200 hover:bg-white/20'
                               }`}>
                                 <div className="flex items-center justify-between">
                                  <div className="text-sm">
                                     <div className={`font-medium ${
                                       isDarkMode ? 'text-white' : 'text-gray-900'
                                     }`}>{appointment.date} at {appointment.time}</div>
                                     <div className={`${
                                       isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                     }`}>{appointment.type} • {appointment.reason}</div>
                                </div>
                                <Badge
                                  variant={
                                    appointment.status === 'confirmed' ? 'default' :
                                    appointment.status === 'completed' ? 'secondary' :
                                    appointment.status === 'rejected' ? 'destructive' : 'outline'
                                  }
                                >
                                  {appointment.status}
                                </Badge>
                              </div>
                          </div>
                             ))
                        ) : (
                             <div className={`text-center py-8 ${
                               isDarkMode ? 'text-gray-400' : 'text-gray-500'
                             }`}>
                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No appointment history found</p>
                          </div>
                        )}
                         </div>
                       </div>

                    {/* Patient Reports */}
                       <div className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
                         isDarkMode 
                           ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                           : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
                       }`}>
                         <div className="mb-6">
                           <div className="flex items-center justify-between">
                             <h3 className={`text-lg font-semibold ${
                               isDarkMode ? 'text-white' : 'text-gray-900'
                             }`}>
                          Medical Reports
                             </h3>
                          <Badge variant="secondary">
                            {(selectedPatient.reports || []).length} reports
                          </Badge>
                           </div>
                         </div>
                         <div className="space-y-3 max-h-64 overflow-y-auto">
                        {selectedPatient.reports && selectedPatient.reports.length > 0 ? (
                             selectedPatient.reports.map((report) => (
                               <div key={report._id} className={`p-3 rounded-lg border transition-all duration-300 hover:shadow-lg ${
                                 isDarkMode 
                                   ? 'bg-white/5 border-white/20 hover:bg-white/10' 
                                   : 'bg-white/10 border-gray-200 hover:bg-white/20'
                               }`}>
                                 <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {report.fileType?.toLowerCase() === 'pdf' ? (
                                       <div className={`w-8 h-10 rounded flex items-center justify-center ${
                                         isDarkMode ? 'bg-red-900' : 'bg-red-100'
                                       }`}>
                                         <FileText className={`h-4 w-4 ${
                                           isDarkMode ? 'text-red-400' : 'text-red-600'
                                         }`} />
                                    </div>
                                  ) : (
                                    <img
                                      src={report.previewUrl || report.url}
                                      alt={report.name}
                                         className="w-8 h-10 object-cover rounded border"
                                      onError={(e) => {
                                           e.target.src = 'https://via.placeholder.com/32x40?text=Img';
                                      }}
                                    />
                                  )}
                                     <div className="text-sm min-w-0 flex-1">
                                       <div className={`font-medium truncate ${
                                         isDarkMode ? 'text-white' : 'text-gray-900'
                                       }`}>{report.name}</div>
                                       <div className={`text-xs ${
                                         isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                       }`}>
                                      {new Date(report.createdAt).toLocaleDateString()} • {report.fileType || 'Unknown'}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(report.url, '_blank')}
                                     className={`transition-all duration-300 hover:scale-105 ${
                                       isDarkMode 
                                         ? 'border-white/30 bg-white/10 hover:bg-white/20 text-white' 
                                         : 'border-gray-300 bg-white/80 hover:bg-white hover:border-gray-400 text-gray-700'
                                     }`}
                                >
                                     <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </div>
                          </div>
                             ))
                        ) : (
                             <div className={`text-center py-8 ${
                               isDarkMode ? 'text-gray-400' : 'text-gray-500'
                             }`}>
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No reports uploaded yet</p>
                          </div>
                        )}
                         </div>
                       </div>
                     </div>
                  </div>
                ) : (
                   <div className={`p-12 text-center rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
                     isDarkMode 
                       ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                       : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
                   }`}>
                      <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                     <h3 className={`text-lg font-semibold mb-2 ${
                       isDarkMode ? 'text-white' : 'text-gray-900'
                     }`}>
                        Select a Patient
                      </h3>
                     <p className={`${
                       isDarkMode ? 'text-gray-400' : 'text-gray-600'
                     }`}>
                        Choose a patient from the list to view their detailed information, appointment history, and medical reports
                      </p>
                   </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Medicine Orders Tab */}
          <TabsContent value="medicine" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold bg-gradient-to-r ${
                isDarkMode 
                  ? 'from-white to-gray-300' 
                  : 'from-gray-900 to-gray-700'
              } bg-clip-text text-transparent`}>Medicine Orders</h2>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { fetchPendingOrders(); fetchApprovedOrders(); fetchSuppliers(); }}
                  className={`transition-all duration-300 hover:scale-105 ${
                    isDarkMode 
                      ? 'border-white/30 bg-white/10 hover:bg-white/20 text-white' 
                      : 'border-gray-300 bg-white/80 hover:bg-white hover:border-gray-400 text-gray-700'
                  }`}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="grid gap-6">
              {/* Pending Orders */}
              <div className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
                isDarkMode 
                  ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                  : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
              }`}>
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Pending Prescription Requests
                  </h3>
                </div>
                <div className="space-y-4">
                  {pendingOrders && pendingOrders.length > 0 ? (
                    pendingOrders.map(order => (
                      <div 
                        key={order._id} 
                        className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                          isDarkMode 
                            ? 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30' 
                            : 'bg-white/10 border-gray-200 hover:bg-white/20 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>Patient: {order.patientId?.name}</div>
                            <div className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>Uploaded: {new Date(order.createdAt).toLocaleString()}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <select 
                              onChange={(e)=>setSelectedSupplierForOrder(order._id, e.target.value)} 
                              className={`px-3 py-2 rounded-lg border transition-all duration-300 ${
                                isDarkMode 
                                  ? 'bg-white/10 border-white/30 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="">Select supplier to forward</option>
                              {suppliers.map(s => (<option key={s._id} value={s._id}>{s.name}</option>))}
                            </select>
                            <Button 
                              onClick={() => forwardOrderToSupplier(order._id)} 
                              className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Forward
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => rejectOrder(order._id)} 
                              className="border-red-300 text-red-600 hover:bg-red-50 transition-all duration-300 hover:scale-105"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                        <div>
                          <a 
                            href={order.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className={`transition-all duration-300 hover:underline ${
                              isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                            }`}
                          >
                            <Eye className="h-4 w-4 inline mr-2" />
                            View Prescription
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`text-center py-8 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No pending orders</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Approved Orders */}
              <div className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
                isDarkMode 
                  ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                  : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
              }`}>
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Approved Medicine Orders
                  </h3>
                </div>
                <div className="space-y-4">
                  {approvedOrders && approvedOrders.length > 0 ? (
                    approvedOrders.map(order => (
                      <div 
                        key={order._id} 
                        className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                          isDarkMode 
                            ? 'bg-green-900/20 border-green-700 hover:bg-green-900/30 hover:border-green-600' 
                            : 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>Patient: {order.patientId?.name}</div>
                            <div className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>Approved: {new Date(order.updatedAt || order.createdAt).toLocaleString()}</div>
                            <div className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>Supplier: {order.supplierId?.name || 'Not assigned'}</div>
                          </div>
                          <Badge 
                            variant="default" 
                            className={`transition-all duration-300 ${
                              isDarkMode 
                                ? 'bg-green-600 text-white' 
                                : 'bg-green-600 text-white'
                            }`}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        </div>
                        <div>
                          <a 
                            href={order.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className={`transition-all duration-300 hover:underline ${
                              isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                            }`}
                          >
                            <Eye className="h-4 w-4 inline mr-2" />
                            View Prescription
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`text-center py-8 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No approved orders yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Generate Prescription</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Prescription Form */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>New Prescription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Patient
                    </label>
                    <Select onValueChange={(value) => {
                      const patient = patients.find(p => String(p.id ?? p._id ?? '') === value);
                      setSelectedPatient(patient || null);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient._id || patient.id} value={String(patient.id ?? patient._id ?? '')}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type of Medication *
                    </label>
                    <Input
                      placeholder="Enter medication name"
                      value={prescriptionForm.medication}
                      onChange={(e) => setPrescriptionForm(prev => ({ ...prev, medication: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duration
                    </label>
                    <Input
                      placeholder="e.g., 30 days"
                      value={prescriptionForm.duration}
                      onChange={(e) => setPrescriptionForm(prev => ({ ...prev, duration: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Special Instructions
                    </label>
                    <Textarea
                      placeholder="Enter any special instructions..."
                      value={prescriptionForm.instructions}
                      onChange={(e) => setPrescriptionForm(prev => ({ ...prev, instructions: e.target.value }))}
                    />
                  </div>

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handlePrescriptionSubmit}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Prescription
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Prescriptions */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Recent Prescriptions for {selectedPatient?.name || 'Selected Patient'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedPatient && selectedPatient.prescriptions && selectedPatient.prescriptions.length > 0 ? (
                    selectedPatient.prescriptions.map((prescription) => (
                      <div key={prescription._id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {prescription.medication}
                          </h4>
                          <Badge variant="outline">{prescription.status}</Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>Patient: {selectedPatient.name}</p>
                          <p>Duration: {prescription.duration}</p>
                          <p>Instructions: {prescription.instructions || 'None'}</p>
                          <p>Prescribed: {new Date(prescription.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  ) : selectedPatient ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No prescriptions found for {selectedPatient.name}</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a patient to view their prescriptions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <div className="grid lg:grid-cols-1 gap-6">
             

              {/* Chat Interface */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-sm h-96">
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedAppointment?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=john"} alt={selectedAppointment?.patient || "Patient"} />
                          <AvatarFallback>{selectedAppointment?.patient?.charAt(0) || "P"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{selectedAppointment?.patient || "Select a Patient"}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Patient • {selectedAppointment ? "Online" : "Select from appointments"}</p>
                        </div>
                      </div>
                      {selectedAppointment && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={startCall}
                            disabled={callActive}
                            className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            {callActive ? 'Call Active' : 'Start Video Call'}
                          </Button>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex flex-col h-full">
                    {/* Video Call Area
                    {callActive && (
                      <div className="p-4 border-b bg-gray-900">
                        <div className="relative bg-black rounded-lg overflow-hidden">
                          <video
                            ref={(el) => {
                              remoteVideoRef.current = el;
                              if (el && remoteStream) {
                                el.srcObject = remoteStream;
                              }
                            }}
                            className="w-full h-48 bg-black"
                            autoPlay
                            playsInline
                          />
                          <div className="absolute bottom-2 right-2 w-32 h-20 bg-black/60 rounded overflow-hidden">
                            <video
                              className="w-full h-full object-cover"
                              autoPlay
                              muted
                              playsInline
                              ref={(el) => {
                                if (el && localStreamRef.current) {
                                  el.srcObject = localStreamRef.current;
                                }
                              }}
                            />
                          </div>
                          <div className="absolute top-2 left-2">
                            <Badge variant="destructive" className="bg-red-600">
                              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                              Live Call
                            </Badge>
                          </div>
                          <div className="absolute top-2 right-2">
                            <Button size="sm" variant="destructive" onClick={endCall}>
                              <X className="h-4 w-4 mr-1" />
                              End Call
                            </Button>
                          </div>
                        </div>
                      </div>
                    )} */}

                    {/* Messages */}
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                      {chatMessagesState.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No messages yet. Start a conversation!</p>
                        </div>
                      ) : (
                        chatMessagesState.map((m, idx) => {
                          const msg = m.message ? m.message : m;
                          const isIncoming = (msg.senderId && String(msg.senderId) !== String(user?.id)) || (m.from && String(m.from) !== String(user?.id));
                          return (
                            <div key={msg._id || m.id || idx} className={`flex ${isIncoming ? 'justify-start' : 'justify-end'}`}>
                              <div className={`max-w-xs px-4 py-2 rounded-lg ${isIncoming ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'bg-blue-600 text-white'}`}>
                                <p className="text-sm">{msg.content || m.content}</p>
                                <p className={`text-xs mt-1 ${isIncoming ? 'text-gray-600 dark:text-gray-400' : 'text-blue-100'}`}>
                                  {new Date(msg.createdAt || m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Type your message..."
                          className="flex-1"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') sendChatMessage(); }}
                          disabled={!selectedAppointment}
                        />
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={sendChatMessage}
                          disabled={!selectedAppointment || !chatInput.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reports Modal */}
      {showReportsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                Reports for {selectedAppointment?.patient}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {patientReports.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {patientReports.map((report) => (
                      <div key={report._id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {report.fileType?.toLowerCase() === 'pdf' ? (
                              <div className="w-16 h-20 bg-red-100 dark:bg-red-900 rounded flex items-center justify-center">
                                <FileText className="h-8 w-8 text-red-600 dark:text-red-400" />
                              </div>
                            ) : (
                              <img
                                src={report.previewUrl || report.url}
                                alt={report.name}
                                className="w-16 h-20 object-cover rounded border"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/64x80?text=Image';
                                }}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                              {report.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {report.description || 'Medical report'}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>Uploaded: {new Date(report.createdAt).toLocaleDateString()}</span>
                              <span className="capitalize">{report.fileType || 'Unknown'}</span>
                              {report.fileSize && <span>{Math.round(report.fileSize / 1024)} KB</span>}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(report.url, '_blank')}
                              className="mr-2"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Reports Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedAppointment?.patient} hasn't uploaded any reports yet.
                  </p>
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowReportsModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                Create Prescription for {selectedPatient?.name}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Prescription Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type of Medication *
                    </label>
                    <Input
                      placeholder="Enter medication name"
                      value={prescriptionForm.medication}
                      onChange={(e) => setPrescriptionForm(prev => ({ ...prev, medication: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duration
                    </label>
                    <Input
                      placeholder="e.g., 30 days"
                      value={prescriptionForm.duration}
                      onChange={(e) => setPrescriptionForm(prev => ({ ...prev, duration: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Special Instructions
                    </label>
                    <Textarea
                      placeholder="Enter any special instructions..."
                      value={prescriptionForm.instructions}
                      onChange={(e) => setPrescriptionForm(prev => ({ ...prev, instructions: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handlePrescriptionSubmit}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Prescription
                  </Button>
                </div>

                {/* Recent Prescriptions for this Patient */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Prescriptions</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {patientPrescriptions && patientPrescriptions.length > 0 ? (
                      patientPrescriptions.map((prescription) => (
                        <div key={prescription._id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                              {prescription.medication}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {prescription.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <p>Duration: {prescription.duration}</p>
                            <p>Instructions: {prescription.instructions || 'None'}</p>
                            <p>Prescribed: {new Date(prescription.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No previous prescriptions</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-6 border-t mt-6">
                <Button variant="outline" onClick={() => setShowPrescriptionModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-50% h-50% max-w-6xl max-h-screen bg-blue-800 rounded-lg overflow-hidden">
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Video Call</h3>
                  <p className="text-white/80 text-sm">In call with patient</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  const socket = connectSocket(localStorage.getItem('neuropath_token'));
                  socket.emit('webrtc:end');
                  endCall();
                }}
                variant="destructive"
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                End Call
              </Button>
            </div>
            <div className="w-full h-full relative">
              <video
                ref={(el) => {
                  remoteVideoRef.current = el;
                  if (el && remoteStream) {
                    el.srcObject = remoteStream;
                  }
                }}
                className="w-full h-full bg-black object-cover"
                autoPlay
                playsInline
              />
              <div className="absolute bottom-4 right-4 w-64 h-48 bg-black/60 rounded-lg border-2 border-white/20 overflow-hidden">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  ref={(el) => {
                    if (el && localStreamRef.current) {
                      el.srcObject = localStreamRef.current;
                    }
                  }}
                />
                <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
                  You
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
