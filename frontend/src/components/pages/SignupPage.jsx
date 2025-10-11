import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { BackendHealth } from '../ui/BackendHealth';
import { useThemeToggle } from '../hooks/useTheme';
import { 
  Brain, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Loader2,
  UserCheck,
  Stethoscope,
  Shield,
  CheckCircle,
  Sparkles,
  Zap,
  Heart,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  const { isDarkMode } = useThemeToggle();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    agreeTerms: false,
    agreePrivacy: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isAnimating, setIsAnimating] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [benefitsVisible, setBenefitsVisible] = useState(false);
  const [particles, setParticles] = useState([]);

  const roles = [
    { 
      value: 'patient', 
      label: 'Patient', 
      icon: UserCheck, 
      color: 'text-blue-500',
      gradient: 'from-blue-500 to-blue-600',
      description: 'Book appointments and manage health records'
    },
    { 
      value: 'neurologist', 
      label: 'Neurologist', 
      icon: Stethoscope, 
      color: 'text-gray-600',
      gradient: 'from-gray-600 to-gray-700',
      description: 'Provide consultations and manage patients'
    }
  ];

  const benefits = [
    { text: 'Access to top neurologists', icon: Brain, gradient: 'from-blue-500 to-blue-600' },
    { text: 'Secure health record management', icon: Shield, gradient: 'from-green-500 to-green-600' },
    { text: '24/7 medical support', icon: Heart, gradient: 'from-red-500 to-red-600' },
    { text: 'Prescription management', icon: Activity, gradient: 'from-blue-600 to-blue-700' },
    { text: 'Video consultations', icon: Zap, gradient: 'from-gray-600 to-gray-700' },
    { text: 'Medicine ordering', icon: Sparkles, gradient: 'from-blue-500 to-blue-600' }
  ];

  useEffect(() => {
    // Staggered animation sequence
    const timer1 = setTimeout(() => {
      setIsAnimating(false);
    }, 200);
    
    const timer2 = setTimeout(() => {
      setBenefitsVisible(true);
    }, 600);
    
    const timer3 = setTimeout(() => {
      setFormVisible(true);
    }, 1000);
    
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
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms of service';
    }

    if (!formData.agreePrivacy) {
      newErrors.agreePrivacy = 'You must agree to the privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const success = await signup(formData.name, formData.email, formData.password, formData.role);
      if (success) {
        toast.success('Account created successfully!');
        navigate(`/${formData.role}-dashboard`);
      } else {
        toast.error('Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error?.message || 'Signup failed. Please try again.');
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
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Morphing Background Orbs */}
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-15 animate-morph ${
          isDarkMode ? 'bg-white' : 'bg-blue-400'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-15 animate-morph delay-1000 ${
          isDarkMode ? 'bg-gray-300' : 'bg-indigo-400'
        }`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 animate-float-slow ${
          isDarkMode ? 'bg-gray-200' : 'bg-purple-400'
        }`}></div>
        
        {/* Floating Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
        
        {/* Additional Glow Effects */}
        <div className={`absolute top-20 left-20 w-32 h-32 rounded-full blur-2xl opacity-20 animate-glow-pulse ${
          isDarkMode ? 'bg-white' : 'bg-blue-300'
        }`}></div>
        <div className={`absolute bottom-20 right-20 w-40 h-40 rounded-full blur-2xl opacity-15 animate-glow-pulse delay-2000 ${
          isDarkMode ? 'bg-gray-300' : 'bg-purple-300'
        }`}></div>
      </div>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className={`mb-8 px-6 py-3 rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
            isDarkMode 
              ? 'text-white border-white/30 bg-white/10 hover:bg-white/20 hover:border-white/50' 
              : 'text-gray-800 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Left Side - Info and Benefits */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-2xl bg-gradient-to-r ${selectedRole?.gradient || 'from-blue-500 to-blue-600'} shadow-lg backdrop-blur-sm`}>
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <span className={`text-3xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    NeuroPath
                  </span>
                </div>
                <h1 className={`text-4xl md:text-5xl font-bold leading-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Join NeuroPath Today
                </h1>
                <p className={`text-lg md:text-xl leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Create your account and start your journey towards better neurological health 
                  with our comprehensive healthcare platform.
                </p>
              </div>

              <div className={`relative overflow-hidden rounded-3xl shadow-2xl backdrop-blur-sm border ${
                isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white/80'
              }`}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758691463165-ca9b5bc2b28a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXVyb2xvZ3klMjBicmFpbiUyMG1lZGljYWx8ZW58MXx8fHwxNzU4Nzc1MTczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Neurology and brain health"
                  className="w-full h-80 object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${
                  isDarkMode ? 'from-black/50 to-transparent' : 'from-white/20 to-transparent'
                }`}></div>
              </div>

              <div className="space-y-6">
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
              </div>

              {/* Role Info */}
              {selectedRole && (
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
              )}
            </div>

            {/* Right Side - Signup Form */}
            <div className="w-full max-w-lg mx-auto lg:max-w-md">
              <BackendHealth />
              <div className={`p-6 md:p-8 rounded-3xl shadow-2xl hover-glow ${
                isDarkMode 
                  ? 'glass-premium-dark' 
                  : 'bg-white/95 border-gray-200 backdrop-blur-sm'
              }`}>
                <div className="space-y-2 pb-8 text-center">
                  <h2 className={`text-2xl md:text-3xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Create Account
                  </h2>
                  <p className={`text-base md:text-lg ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Fill in your details to get started
                  </p>
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
                        <SelectTrigger                         className={`h-12 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover-morph smooth-focus ${
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
                                <span className="font-medium">{role.label}</span>
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
                  </div>


                    {/* Full Name */}
                    <div className="space-y-3">
                      <Label htmlFor="name" className={`text-base font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-700'
                      }`}>
                        Full Name
                      </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`h-12 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
                          errors.name 
                            ? 'border-red-500 bg-red-50/50 dark:bg-red-900/20' 
                            : isDarkMode 
                              ? 'border-white/20 bg-white/5 hover:bg-white/10 focus:border-white/40' 
                              : 'border-gray-300 bg-white hover:bg-gray-50 focus:border-blue-500'
                        }`}
                    />
                    {errors.name && (
                        <p className="text-sm text-red-500 flex items-center space-x-1">
                          <span>⚠️</span>
                          <span>{errors.name}</span>
                        </p>
                    )}
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
                        placeholder="Create a password"
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
                          className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-xl hover:bg-white/20 transition-all duration-300 ${
                            isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                          }`}
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

                    {/* Confirm Password */}
                    <div className="space-y-3">
                      <Label htmlFor="confirmPassword" className={`text-base font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-700'
                      }`}>
                        Confirm Password
                      </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className={`h-12 rounded-2xl backdrop-blur-sm border transition-all duration-300 pr-12 ${
                            errors.confirmPassword 
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
                          className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-xl hover:bg-white/20 transition-all duration-300 ${
                            isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-sm text-red-500 flex items-center space-x-1">
                          <span>⚠️</span>
                          <span>{errors.confirmPassword}</span>
                        </p>
                    )}
                  </div>

                    {/* Terms and Privacy */}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) => handleInputChange('agreeTerms', checked)}
                        className={`rounded-lg border-2 transition-all duration-300 ${
                          errors.agreeTerms 
                            ? 'border-red-500' 
                            : isDarkMode 
                              ? 'border-white/30 data-[state=checked]:bg-blue-500' 
                              : 'border-gray-400 data-[state=checked]:bg-blue-500'
                        }`}
                        />
                        <Label htmlFor="terms" className={`text-sm leading-relaxed cursor-pointer ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        I agree to the{' '}
                          <Button variant="link" className={`p-0 h-auto font-semibold transition-all duration-300 ${
                            isDarkMode 
                              ? 'text-blue-400 hover:text-blue-300' 
                              : 'text-blue-600 hover:text-blue-500'
                          }`}>
                          Terms of Service
                        </Button>
                      </Label>
                    </div>
                    {errors.agreeTerms && (
                        <p className="text-sm text-red-500 flex items-center space-x-1">
                          <span>⚠️</span>
                          <span>{errors.agreeTerms}</span>
                        </p>
                    )}

                      <div className="flex items-start space-x-3">
                      <Checkbox
                        id="privacy"
                        checked={formData.agreePrivacy}
                        onCheckedChange={(checked) => handleInputChange('agreePrivacy', checked)}
                        className={`rounded-lg border-2 transition-all duration-300 ${
                          errors.agreePrivacy 
                            ? 'border-red-500' 
                            : isDarkMode 
                              ? 'border-white/30 data-[state=checked]:bg-blue-500' 
                              : 'border-gray-400 data-[state=checked]:bg-blue-500'
                        }`}
                        />
                        <Label htmlFor="privacy" className={`text-sm leading-relaxed cursor-pointer ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        I agree to the{' '}
                          <Button variant="link" className={`p-0 h-auto font-semibold transition-all duration-300 ${
                            isDarkMode 
                              ? 'text-blue-400 hover:text-blue-300' 
                              : 'text-blue-600 hover:text-blue-500'
                          }`}>
                          Privacy Policy
                        </Button>
                      </Label>
                    </div>
                    {errors.agreePrivacy && (
                        <p className="text-sm text-red-500 flex items-center space-x-1">
                          <span>⚠️</span>
                          <span>{errors.agreePrivacy}</span>
                        </p>
                    )}
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
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Create Account
                          </>
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Login Link */}
                  <div className="text-center pt-6">
                    <p className={`text-base ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Already have an account?{' '}
                      <Button
                        variant="link"
                        className={`p-0 h-auto font-semibold text-lg transition-all duration-300 ${
                          isDarkMode 
                            ? 'text-blue-400 hover:text-blue-300' 
                            : 'text-blue-600 hover:text-blue-500'
                        }`}
                        onClick={() => navigate('/login')}
                      >
                        Sign in here
                      </Button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
