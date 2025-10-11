import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import {
  Calendar,
  Upload,
  ShoppingCart,
  FileText,
  MessageSquare,
  Bell,
  Clock,
  MapPin,
  Phone,
  Star,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Send,
  Video,
  Heart,
  Activity,
  Users,
  TrendingUp,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { ReportPreviewModal } from '../ui/ReportPreviewModal';
import { BookingModal } from '../ui/BookingModal';
import { connectSocket } from '../../lib/socket';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardData, setDashboardData] = useState({
    appointments: [],
    reports: [],
    prescriptions: [],
    stats: {}
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const fileInputRef = React.useRef(null);

  // Medicine order (prescription upload) state
  const [orderUploading, setOrderUploading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const orderFileRef = React.useRef(null);

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewFileType, setPreviewFileType] = useState('');

  // Prescription modal state
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('neurocare_token');
    let socket;
    try {
      socket = connectSocket(token);
      socket.on('appointment:updated', () => {
        // refresh dashboard data when appointment status changes
        fetchDashboardData();
        toast.success('Appointment status updated');
      });
      socket.on('chat:message', (payload) => {
        setChatMessagesState(prev => [{ id: Date.now(), ...payload }, ...prev]);
      });

      socket.on('webrtc:offer', async (payload) => {
        const { from, offer } = payload;
        setIncomingCall({ from, offer });
        setCallOffer(offer);
        toast.info('Incoming video call from doctor');
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

      socket.on('order:updated', () => {
        fetchOrders();
        toast.info('Order status updated');
      });

    } catch (err) {
      console.warn('Patient socket init failed', err);
    }
    return () => {
      try {
        socket && socket.off('appointment:updated');
        socket && socket.off('chat:message');
        socket && socket.off('webrtc:offer');
        socket && socket.off('webrtc:answer');
        socket && socket.off('webrtc:ice');
        socket && socket.off('order:updated');
      } catch (error) {
        console.warn('Socket cleanup error:', error);
      }
    };
  }, []);

  const openPreview = async (report) => {
    setPreviewTitle(report.title || report.name || 'Medical Report');
    setPreviewFileType(report.fileType || report.format || '');

    // If report is PDF/raw, request a signed access URL from server
    if ((report.fileType && report.fileType.toLowerCase() === 'pdf') || (report.publicId && String(report.publicId).includes('pdf'))) {
      try {
        const token = localStorage.getItem('neurocare_token');
        // Ask server for a signed access URL
        const accessRes = await fetch(`http://localhost:5000/api/reports/${report._id || report.id}/access`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!accessRes.ok) throw new Error('Access denied');
        const accessData = await accessRes.json();

        // Use the signed URL directly for PDFs
        setPreviewUrl(accessData.url);
      } catch (err) {
        console.error('Access error:', err);
        setPreviewUrl(report.previewUrl || report.url || report.secure_url || report.link);
      }
    } else {
      setPreviewUrl(report.previewUrl || report.url || report.secure_url || report.link);
    }

    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewUrl('');
    setPreviewTitle('');
  };

  const openPrescriptionDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setPrescriptionModalOpen(true);
  };

  const closePrescriptionModal = () => {
    setPrescriptionModalOpen(false);
    setSelectedPrescription(null);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('neurocare_token');
      const response = await fetch('http://localhost:5000/api/dashboard/patient', {
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
    fetchOrders();
  }, []);

  // Use API data instead of mock data
  const upcomingAppointments = dashboardData.appointments || [];
  const recentReports = dashboardData.reports || [];
  const recentPrescriptions = dashboardData.prescriptions || [];


  // Real-time neurologists from server
  const [neurologists, setNeurologists] = useState([]);
  const [selectedNeurologist, setSelectedNeurologist] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [_promoCodeShown, setPromoCodeShown] = useState(false);

  // Chat & WebRTC state
  const [chatMessagesState, setChatMessagesState] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [currentChatAppointment, setCurrentChatAppointment] = useState(null);
  const pcRef = React.useRef(null);
  const localStreamRef = React.useRef(null);
  const remoteVideoRef = React.useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [_callActive, setCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callOffer, setCallOffer] = useState(null);

  // Set remote video stream when it becomes available
  React.useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : 'http://localhost:5000';

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('neurocare_token');
      const res = await fetch(`${API_BASE}/api/medicine-orders/my`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setOrders(data.orders || []);
    } catch (err) {
      console.warn('Orders fetch failed:', err);
    }
  };

  const toggleExpanded = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const fetchNeurologists = async () => {
    try {
      const token = localStorage.getItem('neurocare_token');
      const res = await fetch(`${API_BASE}/api/appointments/neurologists`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) return;
      const data = await res.json();
      setNeurologists(data.neurologists || []);
      
      // Show promo code status if user has one (only once per session)
      if (data.hasPromoCode && data.promoCode) {
        const notificationKey = `promo_notification_${data.promoCode}`;
        const hasShownNotification = localStorage.getItem(notificationKey);
        
        if (!hasShownNotification) {
          toast.info(`You are assigned to a specific neurologist via promo code: ${data.promoCode}`);
          localStorage.setItem(notificationKey, 'true');
          setPromoCodeShown(true);
        }
      }
    } catch (err) {
      console.warn('Neurologists fetch failed:', err);
    }
  };

  useEffect(() => {
    fetchNeurologists();
    const iv = setInterval(fetchNeurologists, 30000); // Reduced from 10s to 30s
    return () => clearInterval(iv);
  }, []); // Empty dependency array - only run once on mount

  // Load chat messages for an appointment
  const loadChatMessages = async (appointmentId) => {
    try {
      const token = localStorage.getItem('neurocare_token');
      const res = await fetch(`${API_BASE}/api/appointments/${appointmentId}/messages`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) return;
      const data = await res.json();
      setChatMessagesState(data.messages || []);
    } catch (err) {
      console.warn('Load messages failed:', err);
    }
  };

  // Open chat for a specific appointment
  const openChatForAppointment = (appointment) => {
    setCurrentChatAppointment(appointment);
    loadChatMessages(appointment._id || appointment.id);
    setActiveTab('chat');
  };

  const startCall = async () => {
    if (!currentChatAppointment) return toast.error('No appointment selected for call');
    const target = currentChatAppointment.neurologistId || currentChatAppointment.neurologist || currentChatAppointment.doctorId;
    if (!target) return toast.error('No neurologist information available for this appointment');

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
          const socket = connectSocket(localStorage.getItem('neurocare_token'));
          socket.emit('webrtc:ice', { to: target, candidate: e.candidate });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const socket = connectSocket(localStorage.getItem('neurocare_token'));
      socket.emit('webrtc:offer', { to: target, offer });
    } catch (err) {
      console.error('Start call failed', err);
      toast.error('Failed to start call');
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
    } catch (error) {
      console.warn('WebRTC cleanup error:', error);
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
          const socket = connectSocket(localStorage.getItem('neurocare_token'));
          socket.emit('webrtc:ice', { to: incomingCall.from, candidate: e.candidate });
        }
      };

      await pc.setRemoteDescription(callOffer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const socket = connectSocket(localStorage.getItem('neurocare_token'));
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
      const socket = connectSocket(localStorage.getItem('neurocare_token'));
      socket.emit('webrtc:reject', { to: incomingCall.from });
      setIncomingCall(null);
      setCallOffer(null);
      toast.info('Call rejected');
    }
  };

  const sendChatMessage = async () => {
    if (!currentChatAppointment) return toast.error('No appointment selected for chat');
    const appointmentId = currentChatAppointment._id || currentChatAppointment.id;
    if (!chatInput.trim()) return;
    try {
      const token = localStorage.getItem('neurocare_token');
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
      setChatMessagesState(prev => [...prev, data.message]);
      setChatInput('');
    } catch (err) {
      console.error('Send message failed', err);
      toast.error(err.message || 'Failed to send');
    }
  };


  const quickActions = [
    {
      id: 'book-appointment',
      title: 'Book Appointment',
      description: 'Schedule with a neurologist',
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
      action: () => setActiveTab('appointments')
    },
    {
      id: 'upload-report',
      title: 'Upload Report',
      description: 'Upload medical reports',
      icon: Upload,
      color: 'bg-green-50 text-green-600 hover:bg-green-100',
      action: () => setActiveTab('reports')
    },
    {
      id: 'buy-medicines',
      title: 'Buy Medicines',
      description: 'Order from pharmacy',
      icon: ShoppingCart,
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
      action: () => setActiveTab('medicines')
    },
    {
      id: 'chat-doctor',
      title: 'Chat with Doctor',
      description: 'Get instant consultation',
      icon: MessageSquare,
      color: 'bg-teal-50 text-teal-600 hover:bg-teal-100',
      action: () => setActiveTab('chat')
    }
  ];


  const handleUploadReport = () => {
    // trigger hidden file input
    fileInputRef.current?.click();
  };

  const handleUploadPrescriptionOrder = () => {
    orderFileRef.current?.click();
  };

  const handleOrderFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate delivery address is required
    if (!deliveryAddress || deliveryAddress.trim().length === 0) {
      toast.error('Delivery address is required');
      return;
    }
    
    setOrderUploading(true);
    try {
      const token = localStorage.getItem('neurocare_token');
      const form = new FormData();
      form.append('file', file);
      form.append('deliveryAddress', deliveryAddress.trim());
      const uploadRes = await fetch(`${API_BASE}/api/medicine-orders/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) throw new Error(uploadData.message || 'Upload failed');
      toast.success('Prescription uploaded');
      setDeliveryAddress('');
      await fetchOrders();
      setActiveTab('medicines');
    } catch (err) {
      console.error('Order upload error:', err);
      toast.error(err.message || 'Upload failed');
    } finally {
      setOrderUploading(false);
      e.target.value = '';
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('neurocare_token');

      // Upload to server which will forward to Cloudinary
      const form = new FormData();
      form.append('file', file);
      if (uploadTitle) form.append('title', uploadTitle);

      const uploadRes = await fetch('http://localhost:5000/api/reports/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: form,
      });

      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) {
        throw new Error(uploadData.message || 'Upload failed');
      }

      toast.success('Report uploaded successfully');
      await fetchDashboardData();
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your health and stay connected with your neurologists
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Doctor is calling you</p>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="medicines">Medicines</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action) => (
                <Card key={action.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={action.action}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Real-time Neurologists */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">
                Available Neurologists
                {neurologists.length === 1 && neurologists[0]?.isAssigned && (
                  <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    Assigned via Promo Code
                  </span>
                )}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                {neurologists.map((doc) => (
                  <Card key={doc._id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={doc.avatar} alt={doc.name} />
                          <AvatarFallback>{doc.name ? doc.name.charAt(0) : ''}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center">

                            <h3 className="font-semibold text-gray-900 dark:text-white">{doc.name}</h3>

                            <h6
                              className={`flex items-center text-sm font-medium ${doc.available ? 'text-green-600' : 'text-red-600'
                                }`}
                            >
                              <span
                                className={`h-2.5 w-2.5 rounded-full ml-2 mr-2 ${doc.available ? 'bg-green-600' : 'bg-red-600'
                                  }`}
                              ></span>
                            </h6>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-400">{doc.specialty} • {doc.experience}</p>
                          <div className="text-sm text-gray-500 mt-1">{doc.location} • {doc.fee}</div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                            setSelectedNeurologist(doc);
                            setBookingOpen(true);
                          }} disabled={!doc.available}>
                            Book
                          </Button>

                        </div>
                      </div>

                      <div className="flex items-center justify-between">


                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            {/* Recent Reports */}
            <div className="grid lg:grid-cols-1 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Reports
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('reports')}>
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentReports.slice(0, 3).map((report) => (
                    <div key={report._id || report.id || report.publicId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {report.title || report.name || report.original_filename || 'Medical Report'}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {(report.doctor && report.doctor) || (report.neurologistId ? 'Neurologist' : 'Patient')} • {report.date ? report.date : (report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{report.status}</Badge>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => openPreview(report)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={async () => {
                            try {
                              const token = localStorage.getItem('neurocare_token');
                              const res = await fetch(`http://localhost:5000/api/reports/${report._id || report.id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` },
                              });
                              if (!res.ok) throw new Error('Failed to delete');
                              toast.success('Report deleted');
                              await fetchDashboardData();
                            } catch (err) {
                              console.error('Delete error:', err);
                              toast.error('Delete failed');
                            }
                          }}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Prescriptions */}
            <div className="grid lg:grid-cols-1 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Prescriptions
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('prescriptions')}>
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentPrescriptions.slice(0, 3).map((prescription) => (
                    <div key={prescription._id || prescription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {prescription.medication || 'Prescription'}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Dr. {prescription.neurologistId?.name || 'Neurologist'} • {prescription.appointmentId ? `${prescription.appointmentId.date} ${prescription.appointmentId.time}` : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openPrescriptionDetails(prescription)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {recentPrescriptions.length === 0 && (
                    <div className="text-center py-8">
                      <div className="bg-gray-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No prescriptions yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Prescriptions</h2>
            </div>

            {recentPrescriptions.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No prescriptions yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Your prescriptions will appear here once prescribed by your doctor.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-1 gap-6">
                {recentPrescriptions.map((prescription) => (
                  <Card key={prescription._id || prescription.id} className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 p-3 rounded-lg">
                            <FileText className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {prescription.medication || 'Prescription'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Prescribed by Dr. {prescription.neurologistId?.name || 'Neurologist'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => openPrescriptionDetails(prescription)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Book Appointment</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search doctors..."
                    className="pl-10 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
            {/* Upcoming Appointments */}
            <div className="grid lg:grid-cols-1 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Upcoming Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment._id || appointment.id || appointment.publicId} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={appointment.avatar} alt={appointment.doctor} />
                        <AvatarFallback>{appointment.doctor ? appointment.doctor.charAt(0) : ''}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {appointment.doctor}
                          </h4>
                          <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.specialty}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 justify-between">
                          <div className="flex space-x-4 ">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {appointment.date}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {appointment.time}
                            </span>
                          </div>

                          {appointment.status === 'confirmed' && (
                            <div>
                              <Button size="sm" className="bg-blue-600  mx-2 hover:bg-blue-700" onClick={() => openChatForAppointment(appointment)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Chat
                              </Button>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Medical Reports</h2>
              <div className="flex items-center space-x-3">
                <input
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Report name (optional)"
                  className="px-3 py-2 rounded border bg-white dark:bg-gray-700 text-sm w-72"
                />
                <input ref={fileInputRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={handleFileChange} />
                <Button onClick={handleUploadReport} className="bg-blue-600 hover:bg-blue-700" disabled={uploading}>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Report'}
                </Button>
              </div>
            </div>

            {recentReports.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No reports yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Upload your first medical report to get started.</p>
                  <Button onClick={handleUploadReport} className="bg-blue-600 hover:bg-blue-700" disabled={uploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Report'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-1 gap-6">
                {recentReports.map((report) => (
                  <Card key={report._id || report.id || report.publicId} className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {report.title || report.name || report.original_filename || 'Medical Report'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {report.fileType || report.type || report.format || ''} • {report.date ? report.date : (report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '')}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{report.status}</Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Reviewed by:</span>
                          <span className="text-gray-900 dark:text-white">{report.doctor || (report.neurologistId ? 'Neurologist' : '—')}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openPreview(report)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open(report.url || report.secure_url, '_blank')}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Medicines Tab */}
          <TabsContent value="medicines" className="space-y-6">
           


            {/* Prescription upload & tracking */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Prescription for Medicines</h3>
                  <div className="flex items-center space-x-3">
                    <input
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Delivery address (required)*"
                      className="px-3 py-2 rounded border bg-white dark:bg-gray-700 text-sm w-72"
                      required
                    />
                    <input ref={orderFileRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={handleOrderFileChange} />
                    <Button onClick={handleUploadPrescriptionOrder} className="bg-blue-600 hover:bg-blue-700" disabled={orderUploading || !deliveryAddress?.trim()}>
                      <Upload className="h-4 w-4 mr-2" />
                      {orderUploading ? 'Uploading...' : 'Upload Prescription'}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your doctor will review and forward it to a supplier. Please provide your delivery address. Track progress below.</p>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-1 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Prescription Orders & Tracking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Order #{order._id.slice(-6)}</div>
                        <Badge variant="outline" className="capitalize">{(order.status || '').replaceAll('_',' ')}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">Doctor</div>
                          <div className="font-medium">{order.neurologistId?.name || '—'}</div>
                        </div>
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">Supplier</div>
                          <div className="font-medium">{order.supplierId?.name || '—'}</div>
                        </div>
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">Delivery Address</div>
                          <div className="font-medium">{order.deliveryAddress || '—'}</div>
                        </div>
                      </div>
                      {/* Collapsible Tracking Section */}
                      <div className="border-t pt-4">
                        <Button
                          variant="ghost"
                          onClick={() => toggleExpanded(order._id)}
                          className="w-full justify-between p-0 h-auto font-semibold text-sm"
                        >
                          <span>Order Tracking</span>
                          {expandedOrders.has(order._id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        
                        {expandedOrders.has(order._id) && (
                          <div className="mt-4 space-y-2">
                            {(order.timeline || []).map((u, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm p-2 border rounded">
                                <div className="capitalize">{u.status.replaceAll('_',' ')}</div>
                                <div className="text-gray-500">{new Date(u.at).toLocaleString()}</div>
                              </div>
                            ))}
                            {(order.timeline || []).length === 0 && (
                              <div className="text-center py-4 text-gray-500 text-sm">No tracking updates yet</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No prescription orders yet</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Card className="border-0 shadow-sm h-96">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentChatAppointment?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"} alt={currentChatAppointment?.doctor || "Dr. Sarah Johnson"} />
                      <AvatarFallback>{currentChatAppointment?.doctor?.charAt(0) || 'SJ'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{currentChatAppointment?.doctor || 'Dr. Sarah Johnson'}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Neurologist • Online</p>
                    </div>
                  </div>
                  <div>
                    <Button variant="outline" size="sm" onClick={startCall}>
                      <Video className="h-4 w-4 mr-2" />
                      Start Video Call
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-full">
                {/* Video Call Area */}
                {/* {callActive && (
                  <div className="p-4 border-b">
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
                      <div className="absolute bottom-2 right-2 w-32 h-20 bg-black/60 rounded">
                        <video
                          className="w-full h-full"
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
                      <div className="absolute top-2 right-2">
                        <Button size="sm" variant="destructive" onClick={endCall}>End</Button>
                      </div>
                    </div>
                  </div>
                )} */}

                {/* Messages */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {chatMessagesState.map((m, idx) => {
                    const msg = m.message ? m.message : m;
                    const isPatient = (msg.senderId && String(msg.senderId) === String(user?.id)) || (m.from && String(m.from) === String(user?.id));
                    return (
                      <div key={msg._id || m.id || idx} className={`flex ${isPatient ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-lg ${isPatient ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'bg-blue-600 text-white'}`}>
                          <p className="text-sm">{msg.content || m.content}</p>
                          <p className={`text-xs mt-1 ${isPatient ? 'text-gray-600 dark:text-gray-400' : 'text-blue-100'}`}>
                            {new Date(msg.createdAt || m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
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
                    />
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={sendChatMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <ReportPreviewModal isOpen={previewOpen} onClose={closePreview} url={previewUrl} title={previewTitle} fileType={previewFileType} />
        <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} neurologist={selectedNeurologist} onBooked={async () => { await fetchDashboardData(); }} />

        {/* Prescription Details Modal */}
        {prescriptionModalOpen && selectedPrescription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Prescription Details
                  </h3>
                  <Button variant="ghost" size="sm" onClick={closePrescriptionModal}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Prescription Header */}
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedPrescription.medication || 'Prescription'}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Prescribed by Dr. {selectedPrescription.neurologistId?.name || 'Neurologist'}
                    </p>
                  </div>
                </div>

                {/* Prescription Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Medication
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {selectedPrescription.medication || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Duration
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {selectedPrescription.duration || 'N/A'}
                      </p>
                    </div>

                  </div>

                  <div className="space-y-4">

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prescription Date
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {selectedPrescription.createdAt ? new Date(selectedPrescription.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Appointment
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {selectedPrescription.appointmentId ? `${selectedPrescription.appointmentId.date} at ${selectedPrescription.appointmentId.time}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                {selectedPrescription.instructions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Instructions
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-900 dark:text-white">
                        {selectedPrescription.instructions}
                      </p>
                    </div>
                  </div>
                )}

              </div>

              <div className="p-6 border-t bg-gray-50 dark:bg-gray-700 flex justify-end">
                <Button onClick={closePrescriptionModal}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

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
                  <p className="text-white/80 text-sm">In call with doctor</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  const socket = connectSocket(localStorage.getItem('neurocare_token'));
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
