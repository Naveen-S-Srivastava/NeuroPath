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
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [dashboardData, setDashboardData] = useState({
    users: [],
    patients: [],
    stats: {},
    suppliers: []
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
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editPatient, setEditPatient] = useState({
    name: '',
    email: ''
  });

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('neurocare_token');
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
    fetchDashboardData();
  }, []);

  // Use API data instead of mock data
  const systemStats = dashboardData.stats || {};
  const users = dashboardData.users || [];
  const patients = dashboardData.patients || [];
  const suppliers = dashboardData.suppliers || [];

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
    averageRating: Number(systemStats.averageRating || 0)
  };

  // TODO: Replace with API calls
  const doctors = users.filter(u => u.role === 'neurologist') || [];
  const systemAlerts = [
    {
      id: 1,
      type: 'info',
      message: 'System running normally',
      time: 'Just now',
      severity: 'low'
    }
  ];
  

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
      title: 'Total Admins',
      value: String(safeStats.totalAdmins),
      change: '+2%',
      icon: Shield,
      color: 'text-orange-600'
    }
  ];

  const handleUserAction = (userId, action, userType) => {
    toast.success(`${userType} ${action} successfully!`);
  };


  const handleCreateSupplier = async () => {
    if (!newSupplier.supplierId || !newSupplier.password) {
      toast.error('Supplier ID and password are required');
      return;
    }

    try {
      const token = localStorage.getItem('neurocare_token');
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
      const token = localStorage.getItem('neurocare_token');
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

  const handleUpdatePatient = async () => {
    if (!editPatient.name || !editPatient.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      const token = localStorage.getItem('neurocare_token');
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage the NeuroCare platform and monitor system health
              </p>
            </div>
            <div className="flex items-center space-x-4">
              
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Alerts ({systemAlerts.length})
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-sm text-green-600">{stat.change}</p>
                    </div>
                    <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
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
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Doctor
                </Button>
              </div>
            </div>

            <Card className="border-0 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Patients</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor) => (
                    <TableRow key={doctor._id || doctor.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={doctor.avatar} alt={doctor.name} />
                            <AvatarFallback>{doctor.name.charAt(3)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {doctor.name}
                            </div>
                            <div className="text-sm text-gray-500">{doctor.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{doctor.specialty}</TableCell>
                      <TableCell>{doctor.experience}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span>{doctor.rating}</span>
                          <span className="text-yellow-400">★</span>
                        </div>
                      </TableCell>
                      <TableCell>{doctor.patients}</TableCell>
                      <TableCell>
                        <Badge variant={doctor.status === 'active' ? 'default' : 'destructive'}>
                          {doctor.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant={doctor.status === 'active' ? 'destructive' : 'default'} 
                            size="sm"
                            onClick={() => handleUserAction(doctor.id, doctor.status === 'active' ? 'suspended' : 'activated', 'doctor')}
                          >
                            {doctor.status === 'active' ? 'Suspend' : 'Activate'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
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

            <Card className="border-0 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Appointments</TableHead>
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
                      <TableCell>{patient.appointments}</TableCell>
                     
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
                            View Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
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

            <Card className="border-0 shadow-sm">
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
            </Card>
          </TabsContent>

         

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>User Growth Analytics</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Appointment Analytics</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
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
    </div>
  );
};
