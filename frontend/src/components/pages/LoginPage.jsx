import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { 
  Brain, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Loader2,
  UserCheck,
  Stethoscope,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '', // No default role - force user to select
    promoCode: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const roles = [
    { value: 'patient', label: 'Patient', icon: UserCheck, color: 'text-blue-600' },
    { value: 'neurologist', label: 'Neurologist', icon: Stethoscope, color: 'text-teal-600' },
    { value: 'admin', label: 'Administrator', icon: Shield, color: 'text-green-600' }
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
      

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image and Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Link to="/">
                    <Brain className="h-6 w-6 text-white" />
                  </Link>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  NeuroPath
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Welcome Back
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Sign in to access your healthcare dashboard and continue your journey 
                towards better neurological health.
              </p>
            </div>

            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758691463110-697a814b2033?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGVhbSUyMGNvbnN1bHRhdGlvbnxlbnwxfHx8fDE3NTg3OTA5MTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Medical consultation"
              className="w-full h-80 object-cover rounded-2xl shadow-lg"
            />
{/* 
            <div className="grid grid-cols-3 gap-4">
              {roles.map((role) => (
                <div key={role.value} className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <role.icon className={`h-8 w-8 mx-auto mb-2 ${role.color}`} />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{role.label}</p>
                </div>
              ))}
            </div> */}
            {/* Test Credentials Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Test Accounts</h3>
                  <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <p><strong>Admin:</strong> admin@neurocare.com / admin123</p>
                    <p><strong>Neurologist:</strong> sarah@neurocare.com / admin123</p>
                    <p><strong>Patient:</strong> john@neurocare.com / admin123</p>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                    Remember to select the correct role from the dropdown!
                  </p>
                </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-2xl border-0">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
                  Sign In
                </CardTitle>
                <p className="text-center text-gray-600 dark:text-gray-400">
                  Enter your credentials to access your account
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="role">I am a</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => handleInputChange('role', value)}
                    >
                      <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center space-x-2">
                              <role.icon className={`h-4 w-4 ${role.color}`} />
                              <span>{role.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="text-sm text-red-500">{errors.role}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Make sure to select the correct role that matches your account type.
                    </p>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
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
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>

                  {/* Promo Code Field - Only show for patients */}
                  {formData.role === 'patient' && (
                    <div className="space-y-2">
                      <Label htmlFor="promoCode">
                        Promo Code <span className="text-gray-500 text-sm">(Optional)</span>
                      </Label>
                      <Input
                        id="promoCode"
                        type="text"
                        placeholder="Enter promo code if provided by your doctor"
                        value={formData.promoCode}
                        onChange={(e) => handleInputChange('promoCode', e.target.value.toUpperCase())}
                        className={errors.promoCode ? 'border-red-500' : ''}
                      />
                      {errors.promoCode && (
                        <p className="text-sm text-red-500">{errors.promoCode}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        If you have a promo code from your doctor, enter it here to be assigned to a specific neurologist.
                      </p>
                    </div>
                  )}

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) => handleInputChange('rememberMe', checked)}
                      />
                      <Label htmlFor="remember" className="text-sm">
                        Remember me
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-blue-600 hover:text-blue-500"
                      onClick={() => toast.info('Password reset feature coming soon!')}
                    >
                      Forgot password?
                    </Button>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 py-6"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                {/* Sign Up Link */}
                <div className="text-center pt-4 space-y-2">
                  <p className="text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Button
                      variant="link"
                      className="px-0 text-blue-600 hover:text-blue-500"
                      onClick={() => navigate('/signup')}
                    >
                      Sign up here
                    </Button>
                  </p>
                  <div>
                    <Button
                      variant="link"
                      className="px-0 text-blue-600 hover:text-blue-500"
                      onClick={() => navigate('/supplier-login')}
                    >
                      Supplier Login
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
