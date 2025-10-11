import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useAuth } from '../context/AuthContext';
import { useThemeToggle } from '../hooks/useTheme';
import {
  Users,
  UserCheck,
  Calendar,
  ShoppingCart,
  BarChart3,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Activity,
  Stethoscope,
  Shield,
  Bell,
  Settings,
  Weight,
  Brain,
  Sparkles,
  LogOut,
  User,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard = () => {
  const { _user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeToggle();
  const [activeTab, setActiveTab] = useState('overview');
  const [particles, setParticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [dashboardData, setDashboardData] = useState({
    users: [],
    patients: [],
    stats: {},
    suppliers: [],
    neurologists: []
  });
  const [loading, setLoading] = useState(true);
  const [showCreateSupplierModal, setShowCreateSupplierModal] = useState(false);
  const [showViewSupplierModal, setShowViewSupplierModal] = useState(false);
  const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [newSupplier, setNewSupplier] = useState({
    supplierId: '',
    password: '',
    name: '',
    email: '',
    company: ''
  });
  const [editSupplier, setEditSupplier] = useState({
    supplierId: '',
    password: '',
    name: '',
    email: '',
    company: ''
  });
  const [showViewPatientModal, setShowViewPatientModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [showEditPromoCodeModal, setShowEditPromoCodeModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editPatient, setEditPatient] = useState({
    name: '',
    email: ''
  });
  const [editPromoCode, setEditPromoCode] = useState({
    promoCode: ''
  });

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('neuropath_token');
      const response = await fetch('http://localhost:5000/api/dashboard/admin', {
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
    fetchDashboardData();
  }, []);
  // Use API data instead of mock data
  const systemStats = dashboardData.stats || {};
  const patients = dashboardData.patients || [];
  const suppliers = dashboardData.suppliers || [];
  const neurologists = dashboardData.neurologists || [];
  // normalize stats with safe defaults
  const safeStats = {
    totalUsers: Number(systemStats.totalUsers || 0),
    totalPatients: Number(systemStats.totalPatients || 0),
    totalNeurologists: Number(systemStats.totalNeurologists || 0),
    totalAdmins: Number(systemStats.totalAdmins || 0),
    totalDoctors: Number(systemStats.totalDoctors || 0),
    totalRevenue: Number(systemStats.totalRevenue || 0),
    totalAppointments: Number(systemStats.totalAppointments || 0),
    systemUptime: Number(systemStats.systemUptime || 0),
    averageRating: Number(systemStats.averageRating || 0),
    totalSuppliers: Number(dashboardData.suppliers.length || 0)
  };

  // TODO: Replace with API calls
  const doctors = neurologists;
  

  // Filter suppliers based on search query
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
    supplier.supplierId?.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
    supplier.company?.toLowerCase().includes(supplierSearchQuery.toLowerCase())
  );

  // Filter patients based on search query
  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
    patient.email?.toLowerCase().includes(patientSearchQuery.toLowerCase())
  );

  

  const stats = [
    {
      title: 'Total Users',
      value: String(safeStats.totalUsers),
      change: '+12%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Total Patients',
      value: String(safeStats.totalPatients),
      change: '+15%',
      icon: UserCheck,
      color: 'text-green-600'
    },
    {
      title: 'Total Neurologists',
      value: String(safeStats.totalNeurologists),
      change: '+8%',
      icon: Stethoscope,
      color: 'text-purple-600'
    },
    {
      title: 'Total Suppliers',
      value: String(safeStats.totalSuppliers),
      change: '+2%',
      icon: Weight,
      color: 'text-orange-600'
    }
  ];

  const handleCreateSupplier = async () => {
    if (!newSupplier.supplierId || !newSupplier.password) {
      toast.error('Supplier ID and password are required');
      return;
    }

    try {
      const token = localStorage.getItem('neuropath_token');
      const response = await fetch('http://localhost:5000/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newSupplier),
      });

      if (response.ok) {
        toast.success('Supplier created successfully!');
        setNewSupplier({
          supplierId: '',
          password: '',
          name: '',
          email: '',
          company: ''
        });
        setShowCreateSupplierModal(false);
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create supplier');
      }
    } catch (error) {
      console.error('Create supplier error:', error);
      toast.error('Failed to create supplier');
    }
  };

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowViewSupplierModal(true);
  };

  const handleEditSupplier = (supplier) => {
    setEditSupplier({
      supplierId: supplier.supplierId || '',
      password: '', // Don't pre-fill password for security
      name: supplier.name || '',
      email: supplier.email || '',
      company: supplier.company || ''
    });
    setSelectedSupplier(supplier);
    setShowEditSupplierModal(true);
  };

  const handleUpdateSupplier = async () => {
    if (!editSupplier.supplierId) {
      toast.error('Supplier ID is required');
      return;
    }

    try {
      const token = localStorage.getItem('neuropath_token');
      const response = await fetch(`http://localhost:5000/api/suppliers/${selectedSupplier._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editSupplier),
      });

      if (response.ok) {
        toast.success('Supplier updated successfully!');
        setShowEditSupplierModal(false);
        setSelectedSupplier(null);
        setEditSupplier({
          supplierId: '',
          password: '',
          name: '',
          email: '',
          company: ''
        });
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update supplier');
      }
    } catch (error) {
      console.error('Update supplier error:', error);
      toast.error('Failed to update supplier');
    }
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowViewPatientModal(true);
  };

  const handleEditPatient = (patient) => {
    setEditPatient({
      name: patient.name || '',
      email: patient.email || ''
    });
    setSelectedPatient(patient);
    setShowEditPatientModal(true);
  };

  const handleEditPatientPromoCode = (patient) => {
    setEditPromoCode({
      promoCode: patient.promoCode || ''
    });
    setSelectedPatient(patient);
    setShowEditPromoCodeModal(true);
  };

  const handleUpdatePatientPromoCode = async () => {
    if (!selectedPatient) return;

    try {
      const token = localStorage.getItem('neuropath_token');
      const response = await fetch(`http://localhost:5000/api/users/${selectedPatient._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          promoCode: editPromoCode.promoCode || null
        }),
      });

      if (response.ok) {
        toast.success('Patient promo code updated successfully!');
        setShowEditPromoCodeModal(false);
        setSelectedPatient(null);
        setEditPromoCode({ promoCode: '' });
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update promo code');
      }
    } catch (error) {
      console.error('Update promo code error:', error);
      toast.error('Failed to update promo code');
    }
  };

  const handleUpdatePatient = async () => {
    if (!editPatient.name || !editPatient.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      const token = localStorage.getItem('neuropath_token');
      const response = await fetch(`http://localhost:5000/api/users/${selectedPatient._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editPatient.name,
          email: editPatient.email
        }),
      });

      if (response.ok) {
        toast.success('Patient updated successfully!');
        setShowEditPatientModal(false);
        setSelectedPatient(null);
        setEditPatient({
          name: '',
          email: ''
        });
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update patient');
      }
    } catch (error) {
      console.error('Update patient error:', error);
      toast.error('Failed to update patient');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
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
                  Admin Dashboard
                </h1>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Manage the NeuroPath platform and monitor system health
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

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`transition-all duration-300 hover:scale-105 animate-slide-in-blur`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
                  isDarkMode 
                    ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                    : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>{stat.title}</p>
                      <p className={`text-2xl font-bold transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {stat.value}
                      </p>
                      <p className="text-sm text-green-600">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
                      isDarkMode ? 'bg-white/20' : 'bg-white/80'
                    }`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full grid-cols-4 backdrop-blur-md border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-white/10 border-white/20' 
              : 'bg-white/20 border-white/30'
          }`}>
            <TabsTrigger 
              value="analytics"
              className={`transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'data-[state=active]:bg-white/20 data-[state=active]:text-white hover:bg-white/10' 
                  : 'data-[state=active]:bg-blue-500 data-[state=active]:text-white hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="doctors"
              className={`transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'data-[state=active]:bg-white/20 data-[state=active]:text-white hover:bg-white/10' 
                  : 'data-[state=active]:bg-blue-500 data-[state=active]:text-white hover:bg-gray-100'
              }`}
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Doctors
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
              Patients
            </TabsTrigger>
            <TabsTrigger 
              value="suppliers"
              className={`transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'data-[state=active]:bg-white/20 data-[state=active]:text-white hover:bg-white/10' 
                  : 'data-[state=active]:bg-blue-500 data-[state=active]:text-white hover:bg-gray-100'
              }`}
            >
              <Weight className="h-4 w-4 mr-2" />
              Suppliers
            </TabsTrigger>
          </TabsList>


          {/* Doctors Tab */}
          <TabsContent value="doctors" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Management</h2>
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

            <div className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
            }`}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Neurologist</TableHead>
                    <TableHead>Promo Code</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Total Appointments</TableHead>
                    <TableHead>Confirmed</TableHead>
                    <TableHead>Completed</TableHead>
                    {/* <TableHead>Actions</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor) => (
                    <TableRow key={doctor._id || doctor.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={doctor.avatar} alt={doctor.name} />
                            <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {doctor.name}
                            </div>
                            <div className="text-sm text-gray-500">{doctor.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {doctor.promoCodes && doctor.promoCodes.length > 0 ? (
                          <div className="space-y-1">
                            {doctor.promoCodes.slice(0, 2).map((promo, index) => (
                              <div key={index} className="text-sm">
                                <Badge variant="outline" className="text-xs">
                                  {promo.code}
                                </Badge>
                                {promo.isActive ? (
                                  <span className="text-green-600 ml-1">✓</span>
                                ) : (
                                  <span className="text-red-600 ml-1">✗</span>
                                )}
                              </div>
                            ))}
                            {doctor.promoCodes.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{doctor.promoCodes.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">No promo codes</span>
                        )}
                      </TableCell>
                      <TableCell>{doctor.joinDate}</TableCell>
                      <TableCell>{doctor.totalAppointments}</TableCell>
                      <TableCell>{doctor.confirmedAppointments}</TableCell>
                      <TableCell>{doctor.completedAppointments}</TableCell>
                      {/* <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    placeholder="Search patients..." 
                    className="pl-10 w-64"
                    value={patientSearchQuery}
                    onChange={(e) => setPatientSearchQuery(e.target.value)}
                  />
                </div>
                
              </div>
            </div>

            <div className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
            }`}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Promo Code</TableHead>
                    <TableHead>Assigned Neurologist</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient._id || patient.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={patient.avatar} alt={patient.name} />
                            <AvatarFallback>{patient.name ? patient.name.charAt(0) : '?'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {patient.name}
                            </div>
                            <div className="text-sm text-gray-500">{patient.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell>{patient.joinDate}</TableCell>
                      <TableCell>{patient.lastVisit}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {patient.promoCode || 'None'}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditPatientPromoCode(patient)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.assignedNeurologist ? (
                          <div className="text-sm">
                            <div className="font-medium">{patient.assignedNeurologist.name}</div>
                            <div className="text-gray-500">{patient.assignedNeurologist.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditPatient(patient)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewPatient(patient)}
                          >
                            <Eye className="h-8 w-8" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Supplier Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    placeholder="Search suppliers..." 
                    className="pl-10 w-64"
                    value={supplierSearchQuery}
                    onChange={(e) => setSupplierSearchQuery(e.target.value)}
                  />
                </div>
                
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowCreateSupplierModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              </div>
            </div>

            <div className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
            }`}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Supplier ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier._id || supplier.id || supplier.supplierId}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={supplier.avatar} alt={supplier.name} />
                            <AvatarFallback>{supplier.name ? supplier.name.charAt(0) : '?'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {supplier.name}
                            </div>
                            <div className="text-sm text-gray-500">{supplier.supplierId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{supplier.company}</TableCell>
                      <TableCell>{supplier.supplierId}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
                      <TableCell>
                        <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                          {supplier.status || 'active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditSupplier(supplier)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewSupplier(supplier)}
                          >
                            View Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

         

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
                isDarkMode 
                  ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                  : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
              }`}>
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    User Growth Analytics
                  </h3>
                </div>
                <div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Users</span>
                      <span className="font-semibold">{safeStats.totalUsers}</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Doctors</span>
                      <span className="font-semibold">{safeStats.totalDoctors}</span>
                    </div>
                    <Progress value={65} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Patients</span>
                      <span className="font-semibold">{safeStats.totalPatients}</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
                isDarkMode 
                  ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                  : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
              }`}>
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Revenue Analytics
                  </h3>
                </div>
                <div>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        ${safeStats.totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-semibold">$12,450</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">This Month</div>
                      </div>
                      <div>
                        <div className="text-xl font-semibold">$8,320</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Last Month</div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <div className="flex items-center justify-center space-x-2 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">+18% growth</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
                isDarkMode 
                  ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                  : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
              }`}>
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Appointment Analytics
                  </h3>
                </div>
                <div>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {safeStats.totalAppointments}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Appointments</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <div className="font-semibold">156</div>
                        <div className="text-xs text-green-600">Completed</div>
                      </div>
                      <div>
                        <div className="font-semibold">24</div>
                        <div className="text-xs text-blue-600">Scheduled</div>
                      </div>
                      <div>
                        <div className="font-semibold">8</div>
                        <div className="text-xs text-red-600">Cancelled</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:shadow-xl ${
                isDarkMode 
                  ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30' 
                  : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg'
              }`}>
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    System Performance
                  </h3>
                </div>
                <div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">System Uptime</span>
                      <span className="font-semibold text-green-600">{safeStats.systemUptime}%</span>
                    </div>
                    <Progress value={safeStats.systemUptime} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Average Rating</span>
                      <span className="font-semibold">{safeStats.averageRating}/5</span>
                    </div>
                    <Progress value={safeStats.averageRating * 20} className="h-2" />
                    
                    <div className="pt-2 text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        System running smoothly
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Supplier Modal */}
      <Dialog open={showCreateSupplierModal} onOpenChange={setShowCreateSupplierModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Supplier</DialogTitle>
            <DialogDescription>
              Add a new supplier to the system. They will be able to log in with their unique supplier ID and password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="supplierId" className="text-right">
                Supplier ID
              </label>
              <Input
                id="supplierId"
                value={newSupplier.supplierId}
                onChange={(e) => setNewSupplier({...newSupplier, supplierId: e.target.value})}
                className="col-span-3"
                placeholder="Enter unique supplier ID"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="password" className="text-right">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={newSupplier.password}
                onChange={(e) => setNewSupplier({...newSupplier, password: e.target.value})}
                className="col-span-3"
                placeholder="Enter password"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <Input
                id="name"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                className="col-span-3"
                placeholder="Enter supplier name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                className="col-span-3"
                placeholder="Enter email address"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="company" className="text-right">
                Company
              </label>
              <Input
                id="company"
                value={newSupplier.company}
                onChange={(e) => setNewSupplier({...newSupplier, company: e.target.value})}
                className="col-span-3"
                placeholder="Enter company name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateSupplierModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSupplier} className="bg-blue-600 hover:bg-blue-700">
              Create Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Supplier Modal */}
      <Dialog open={showViewSupplierModal} onOpenChange={setShowViewSupplierModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Supplier Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected supplier.
            </DialogDescription>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedSupplier.avatar} alt={selectedSupplier.name} />
                  <AvatarFallback>{selectedSupplier.name ? selectedSupplier.name.charAt(0) : '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedSupplier.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSupplier.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Supplier ID</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedSupplier.supplierId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedSupplier.company || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <Badge variant={selectedSupplier.status === 'active' ? 'default' : 'secondary'}>
                    {selectedSupplier.status || 'active'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedSupplier.createdAt ? new Date(selectedSupplier.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewSupplierModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Modal */}
      <Dialog open={showEditSupplierModal} onOpenChange={setShowEditSupplierModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update supplier information. Leave password blank to keep current password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-supplierId" className="text-right">
                Supplier ID
              </label>
              <Input
                id="edit-supplierId"
                value={editSupplier.supplierId}
                onChange={(e) => setEditSupplier({...editSupplier, supplierId: e.target.value})}
                className="col-span-3"
                placeholder="Enter unique supplier ID"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-password" className="text-right">
                Password
              </label>
              <Input
                id="edit-password"
                type="password"
                value={editSupplier.password}
                onChange={(e) => setEditSupplier({...editSupplier, password: e.target.value})}
                className="col-span-3"
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-name" className="text-right">
                Name
              </label>
              <Input
                id="edit-name"
                value={editSupplier.name}
                onChange={(e) => setEditSupplier({...editSupplier, name: e.target.value})}
                className="col-span-3"
                placeholder="Enter supplier name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-email" className="text-right">
                Email
              </label>
              <Input
                id="edit-email"
                type="email"
                value={editSupplier.email}
                onChange={(e) => setEditSupplier({...editSupplier, email: e.target.value})}
                className="col-span-3"
                placeholder="Enter email address"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-company" className="text-right">
                Company
              </label>
              <Input
                id="edit-company"
                value={editSupplier.company}
                onChange={(e) => setEditSupplier({...editSupplier, company: e.target.value})}
                className="col-span-3"
                placeholder="Enter company name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditSupplierModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSupplier} className="bg-blue-600 hover:bg-blue-700">
              Update Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Patient Modal */}
      <Dialog open={showViewPatientModal} onOpenChange={setShowViewPatientModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected patient.
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedPatient.avatar} alt={selectedPatient.name} />
                  <AvatarFallback>{selectedPatient.name ? selectedPatient.name.charAt(0) : '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedPatient.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPatient.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedPatient.age || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <Badge variant={selectedPatient.status === 'active' ? 'default' : 'secondary'}>
                    {selectedPatient.status || 'active'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Join Date</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedPatient.joinDate || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Visit</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedPatient.lastVisit || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Appointments</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedPatient.appointments || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedPatient.createdAt ? new Date(selectedPatient.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewPatientModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Modal */}
      <Dialog open={showEditPatientModal} onOpenChange={setShowEditPatientModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>
              Update patient information and status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-patient-name" className="text-right">
                Name
              </label>
              <Input
                id="edit-patient-name"
                value={editPatient.name}
                onChange={(e) => setEditPatient({...editPatient, name: e.target.value})}
                className="col-span-3"
                placeholder="Enter patient name"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-patient-email" className="text-right">
                Email
              </label>
              <Input
                id="edit-patient-email"
                type="email"
                value={editPatient.email}
                onChange={(e) => setEditPatient({...editPatient, email: e.target.value})}
                className="col-span-3"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPatientModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePatient} className="bg-blue-600 hover:bg-blue-700">
              Update Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Promo Code Modal */}
      <Dialog open={showEditPromoCodeModal} onOpenChange={setShowEditPromoCodeModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Patient Promo Code</DialogTitle>
            <DialogDescription>
              Update the promo code for {selectedPatient?.name}. Leave empty to remove promo code.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-promo-code" className="text-right">
                Promo Code
              </label>
              <Input
                id="edit-promo-code"
                value={editPromoCode.promoCode}
                onChange={(e) => setEditPromoCode({...editPromoCode, promoCode: e.target.value.toUpperCase()})}
                className="col-span-3"
                placeholder="Enter promo code (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPromoCodeModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePatientPromoCode} className="bg-blue-600 hover:bg-blue-700">
              Update Promo Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
