import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuth } from '../context/AuthContext';
import { useThemeToggle } from '../hooks/useTheme';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { 
  Brain, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Loader2,
  UserCheck,
  Stethoscope,
  Shield,
  Sparkles,
  Zap,
  Heart,
  Activity,
  PlayCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { isDarkMode } = useThemeToggle();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '', // No default role - force user to select
    promoCode: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [particles, setParticles] = useState([]);
  const [showPromoCode, setShowPromoCode] = useState(false);

  const roles = [
    { 
      value: 'patient', 
      label: 'Patient', 
      icon: UserCheck, 
      gradient: 'from-blue-500 to-blue-600',
      description: 'Access your health records and book appointments'
    },
    { 
      value: 'neurologist', 
      label: 'Neurologist', 
      icon: Stethoscope, 
      gradient: 'from-teal-500 to-teal-600',
      description: 'Manage patients and consultations'
    },
    { 
      value: 'admin', 
      label: 'Administrator', 
      icon: Shield, 
      gradient: 'from-green-500 to-green-600',
      description: 'System administration and oversight'
    }
  ];

  const demoAccounts = [
    { 
      role: 'admin', 
      email: 'admin@neuropath.com', 
      password: 'admin123',
      label: 'Admin Demo'
    },
    { 
      role: 'neurologist', 
      email: 'sarah@neuropath.com', 
      password: 'admin123',
      label: 'Neurologist Demo'
    },
    { 
      role: 'patient', 
      email: 'john@neuropath.com', 
      password: 'admin123',
      label: 'Patient Demo'
    }
  ];

  // const benefits = [
  //   { text: 'Access to top neurologists', icon: Brain, gradient: 'from-blue-500 to-blue-600' },
  //   { text: 'Secure health record management', icon: Shield, gradient: 'from-green-500 to-green-600' },
  //   { text: '24/7 medical support', icon: Heart, gradient: 'from-red-500 to-red-600' },
  //   { text: 'Prescription management', icon: Activity, gradient: 'from-blue-600 to-blue-700' },
  //   { text: 'Video consultations', icon: Zap, gradient: 'from-gray-600 to-gray-700' },
  //   { text: 'Medicine ordering', icon: Sparkles, gradient: 'from-blue-500 to-blue-600' }
  // ];

  useEffect(() => {
    // Create floating particles
    const createParticles = () => {
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 6 + Math.random() * 4,
      }));
      setParticles(newParticles);
    };
    
    createParticles();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fillDemoData = (account) => {
    setFormData({
      ...formData,
      email: account.email,
      password: account.password,
      role: account.role,
      promoCode: '',
      rememberMe: false
    });
    setErrors({});
    toast.success(`Filled ${account.label} credentials`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const success = await login(formData.email, formData.password, formData.role, formData.promoCode);
      if (success) {
        toast.success('Login successful!');
        navigate(`/${formData.role}-dashboard`);
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials and role selection.');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectedRole = roles.find(role => role.value === formData.role);

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-1000 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 via-white to-teal-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Morphing Orbs */}
        <div className={`absolute top-20 left-20 w-72 h-72 rounded-full animate-morph ${
          isDarkMode ? 'bg-white/10' : 'bg-blue-500/20'
        } blur-3xl`}></div>
        <div className={`absolute bottom-20 right-20 w-96 h-96 rounded-full animate-morph ${
          isDarkMode ? 'bg-gray-300/10' : 'bg-teal-500/20'
        } blur-3xl`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full animate-morph ${
          isDarkMode ? 'bg-gray-200/10' : 'bg-purple-500/20'
        } blur-3xl`} style={{ animationDelay: '4s' }}></div>

        {/* Floating Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute w-2 h-2 rounded-full particle animate-float-slow ${
              isDarkMode ? 'bg-white/40' : 'bg-blue-500/40'
            }`}
            style={{
              left: `${particle.left}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}

        {/* Glow Effects */}
        <div className={`absolute top-1/4 left-1/4 w-32 h-32 rounded-full animate-glow-pulse ${
          isDarkMode ? 'bg-white/20' : 'bg-blue-500/30'
        } blur-2xl`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full animate-glow-pulse ${
          isDarkMode ? 'bg-gray-300/20' : 'bg-teal-500/30'
        } blur-2xl`} style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
         

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Left Side - Info and Benefits */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Link to="/">
                  <div className={`p-3 rounded-2xl bg-gradient-to-r ${selectedRole?.gradient || 'from-blue-500 to-blue-600'} shadow-lg backdrop-blur-sm`}>
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  </Link>
                  <span className={`text-3xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    NeuroPath
                  </span>
                </div>
                <h1 className={`text-4xl md:text-5xl font-bold leading-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Welcome Back
                </h1>
                <p className={`text-lg md:text-xl leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Sign in to access your healthcare  </p>
              </div>

              <div className={`relative overflow-hidden rounded-3xl shadow-2xl backdrop-blur-sm border ${
                isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white/80'
              }`}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758691463110-697a814b2033?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGVhbSUyMGNvbnN1bHRhdGlvbnxlbnwxfHx8fDE3NTg3OTA5MTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Medical consultation"
                  className="w-full h-80 object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${
                  isDarkMode ? 'from-black/50 to-transparent' : 'from-white/20 to-transparent'
                }`}></div>
              </div>

              {/* Sign Up Links */}
              <div className={`p-6`}>
                <div className="text-centeR">
                 
                  <div className="space-y-3 flex flex-row gap-8 text-center justify-center">
                    <Button
                      variant="outline"
                      className={` h-12 rounded-xl font-semibold transition-all duration-300 ${
                        isDarkMode 
                          ? 'border-white/20 bg-white/5 hover:bg-white/10 text-white' 
                          : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                      onClick={() => navigate('/signup')}
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Create Patient Account
                    </Button>
                    <Button
                      variant="outline"
                      className={` h-12 rounded-xl font-semibold transition-all duration-300 ${
                        isDarkMode 
                          ? 'border-white/20 bg-white/5 hover:bg-white/10 text-white' 
                          : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                      onClick={() => navigate('/supplier-login')}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Supplier Portal
                    </Button>
                  </div>
                </div>
              </div>
              {/* <div className="space-y-6">
                <h3 className={`text-2xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  What you'll get:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center space-x-3 p-4 rounded-2xl backdrop-blur-sm border transition-all duration-500 hover-morph hover-glow ${
                        isDarkMode 
                          ? 'border-white/10 bg-white/5 hover:bg-white/10' 
                          : 'border-gray-200 bg-white/90 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded-xl bg-gradient-to-r ${benefit.gradient} shadow-lg`}>
                        <benefit.icon className="h-5 w-5 text-white" />
                      </div>
                      <span className={`font-medium ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {benefit.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Role Info */}
              {/* {selectedRole && (
                <div className={`p-8 rounded-3xl backdrop-blur-sm border shadow-2xl transition-all duration-500 hover:scale-105 ${
                  isDarkMode 
                    ? 'border-white/10 bg-gradient-to-br from-white/5 to-white/10' 
                    : 'border-gray-200 bg-gradient-to-br from-white/90 to-gray-50'
                }`}>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${selectedRole.gradient} shadow-lg`}>
                      <selectedRole.icon className="h-8 w-8 text-white" />
                    </div>
                    <h4 className={`text-2xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {selectedRole.label} Account
                    </h4>
                  </div>
                  <p className={`text-lg leading-relaxed ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {selectedRole.description}
                  </p>
                </div>
              )} */}

              {/* Test Credentials Info */}
              {/* <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                isDarkMode 
                  ? 'border-white/10 bg-white/5' 
                  : 'border-gray-200 bg-white/90'
              }`}>
                <h3 className={`text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-blue-100' : 'text-blue-900'
                }`}>Test Accounts</h3>
                <div className={`text-xs space-y-1 ${
                  isDarkMode ? 'text-blue-200' : 'text-blue-800'
                }`}>
                  <p><strong>Admin:</strong> admin@neuropath.com / admin123</p>
                  <p><strong>Neurologist:</strong> sarah@neuropath.com / admin123</p>
                  <p><strong>Patient:</strong> john@neuropath.com / admin123</p>
                </div>
                <p className={`text-xs mt-2 ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  Remember to select the correct role from the dropdown!
                </p>
              </div> */}
          </div>

            {/* Right Side - Login Form */}
            <div className="w-full max-w-lg mx-auto lg:max-w-md">
              <div className={`p-6 md:p-8 rounded-3xl shadow-2xl hover-glow ${
                isDarkMode 
                  ? 'glass-premium-dark' 
                  : 'bg-white/95 border-gray-200 backdrop-blur-sm'
              }`}>
                <div className="space-y-2 pb-8">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <h2 className={`text-2xl md:text-3xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Sign In
                      </h2>
                      <p className={`text-base md:text-lg ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Enter your credentials to access your account
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`ml-4 p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                            isDarkMode 
                              ? 'hover:bg-white/10 text-gray-400 hover:text-blue-400' 
                              : 'hover:bg-gray-100 text-gray-500 hover:text-blue-600'
                          }`}
                        >
                          <PlayCircle className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {demoAccounts.map((account) => (
                          <DropdownMenuItem
                            key={account.role}
                            onClick={() => fillDemoData(account)}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              {account.role === 'admin' && <Shield className="h-4 w-4 text-green-500" />}
                              {account.role === 'neurologist' && <Stethoscope className="h-4 w-4 text-teal-500" />}
                              {account.role === 'patient' && <UserCheck className="h-4 w-4 text-blue-500" />}
                              <span>{account.label}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="space-y-6">
                

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Role Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="role" className={`text-base font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-700'
                      }`}>
                        I am a
                      </Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => handleInputChange('role', value)}
                      >
                        <SelectTrigger className={`h-12 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover-morph smooth-focus ${
                          errors.role 
                            ? 'border-red-500 bg-red-50/50 dark:bg-red-900/20' 
                            : isDarkMode 
                              ? 'border-white/20 bg-white/5 hover:bg-white/10 focus:border-white/40' 
                              : 'border-gray-300 bg-white hover:bg-gray-50 focus:border-blue-500'
                        }`}>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent className="backdrop-blur-xl border-gray-200 bg-white dark:bg-gray-800/90">
                          {roles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              <div className="flex items-center space-x-3">
                                <div className={`p-1.5 rounded-lg bg-gradient-to-r ${role.gradient}`}>
                                  <role.icon className="h-4 w-4 text-white" />
                                </div>
                                <span>{role.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.role && (
                        <p className="text-sm text-red-500 flex items-center space-x-1">
                          <span>⚠️</span>
                          <span>{errors.role}</span>
                        </p>
                      )}
                      <p className={`text-xs mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Make sure to select the correct role that matches your account type.
                      </p>
                    </div>

                    {/* Email */}
                    <div className="space-y-3">
                      <Label htmlFor="email" className={`text-base font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-700'
                      }`}>
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`h-12 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
                          errors.email 
                            ? 'border-red-500 bg-red-50/50 dark:bg-red-900/20' 
                            : isDarkMode 
                              ? 'border-white/20 bg-white/5 hover:bg-white/10 focus:border-white/40' 
                              : 'border-gray-300 bg-white hover:bg-gray-50 focus:border-blue-500'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 flex items-center space-x-1">
                          <span>⚠️</span>
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-3">
                      <Label htmlFor="password" className={`text-base font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-700'
                      }`}>
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className={`h-12 rounded-2xl backdrop-blur-sm border transition-all duration-300 pr-12 ${
                            errors.password 
                              ? 'border-red-500 bg-red-50/50 dark:bg-red-900/20' 
                              : isDarkMode 
                                ? 'border-white/20 bg-white/5 hover:bg-white/10 focus:border-white/40' 
                                : 'border-gray-300 bg-white hover:bg-gray-50 focus:border-blue-500'
                          }`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-500 flex items-center space-x-1">
                          <span>⚠️</span>
                          <span>{errors.password}</span>
                        </p>
                      )}
                    </div>

                    {/* Promo Code Field - Only show for patients */}
                    {formData.role === 'patient' && (
                      <div className="space-y-3">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowPromoCode(!showPromoCode)}
                          className={`w-full h-12 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover-morph ${
                            errors.promoCode 
                              ? 'border-red-500 bg-red-50/50 dark:bg-red-900/20' 
                              : isDarkMode 
                                ? 'border-white/20 bg-white/5 hover:bg-white/10' 
                                : 'border-gray-300 bg-white hover:bg-gray-50'
                          } flex items-center justify-between px-4`}
                        >
                          <span className={`text-base font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-700'
                          }`}>
                            Promo Code <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>(Optional)</span>
                          </span>
                          {showPromoCode ? (
                            <ChevronUp className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          ) : (
                            <ChevronDown className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          )}
                        </Button>
                        
                        {showPromoCode && (
                          <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                            <Input
                              id="promoCode"
                              type="text"
                              placeholder="Enter promo code if provided by your doctor"
                              value={formData.promoCode}
                              onChange={(e) => handleInputChange('promoCode', e.target.value.toUpperCase())}
                              className={`h-12 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
                                errors.promoCode 
                                  ? 'border-red-500 bg-red-50/50 dark:bg-red-900/20' 
                                  : isDarkMode 
                                    ? 'border-white/20 bg-white/5 hover:bg-white/10 focus:border-white/40' 
                                    : 'border-gray-300 bg-white hover:bg-gray-50 focus:border-blue-500'
                              }`}
                            />
                            {errors.promoCode && (
                              <p className="text-sm text-red-500 flex items-center space-x-1">
                                <span>⚠️</span>
                                <span>{errors.promoCode}</span>
                              </p>
                            )}
                            <p className={`text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              If you have a promo code from your doctor, enter it here to be assigned to a specific neurologist.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="remember"
                          checked={formData.rememberMe}
                          onCheckedChange={(checked) => handleInputChange('rememberMe', checked)}
                          className={`rounded-lg border-2 transition-all duration-300 ${
                            isDarkMode 
                              ? 'border-white/30 data-[state=checked]:bg-blue-500' 
                              : 'border-gray-400 data-[state=checked]:bg-blue-500'
                          }`}
                        />
                        <Label htmlFor="remember" className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Remember me
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant="link"
                        className={`p-0 h-auto font-semibold text-lg transition-all duration-300 ${
                          isDarkMode 
                            ? 'text-blue-400 hover:text-blue-300' 
                            : 'text-blue-600 hover:text-blue-500'
                        }`}
                        onClick={() => toast.info('Password reset feature coming soon!')}
                      >
                        Forgot password?
                      </Button>
                    </div>

                    {/* Submit Button */}
                    <div>
                      <Button
                        type="submit"
                        className={`w-full h-14 rounded-2xl font-semibold text-lg transition-all duration-500 transform hover:scale-105 hover:shadow-2xl ripple-effect animate-glow-pulse ${
                          selectedRole?.gradient 
                            ? `bg-gradient-to-r ${selectedRole.gradient} hover:shadow-lg` 
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                        } shadow-lg`}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Sign In
                          </>
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Sign Up Link */}
                  {/* <div className="text-center pt-6">
                    <p className={`text-base ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Don't have an account?{' '}
                      <Button
                        variant="link"
                        className={`p-0 h-auto font-semibold text-lg transition-all duration-300 ${
                          isDarkMode 
                            ? 'text-blue-400 hover:text-blue-300' 
                            : 'text-blue-600 hover:text-blue-500'
                        }`}
                        onClick={() => navigate('/signup')}
                      >
                        Sign up here
                      </Button>
                    </p>
                    <div className="mt-2">
                      <Button
                        variant="link"
                        className={`p-0 h-auto font-semibold text-lg transition-all duration-300 ${
                          isDarkMode 
                            ? 'text-blue-400 hover:text-blue-300' 
                            : 'text-blue-600 hover:text-blue-500'
                        }`}
                        onClick={() => navigate('/supplier-login')}
                      >
                        Supplier Login
                      </Button>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
