import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { 
  ArrowLeft, 
  Shield, 
  Truck, 
  Package, 
  Loader2,
  Eye,
  EyeOff,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

export const SupplierLoginPage = () => {
  const navigate = useNavigate();
  const [supplierId, setSupplierId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierId || !password) return toast.error('Enter Supplier ID and password');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/suppliers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('supplier_user', JSON.stringify(data.supplier));
      localStorage.setItem('supplier_token', data.token);
      toast.success('Logged in successfully');
      navigate('/supplier-dashboard');
    } catch (err) {
      console.error('Supplier login error:', err);
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!supplierId) {
      toast.error('Please enter your Supplier ID first');
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/suppliers/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to send recovery email');
      toast.success('Recovery instructions sent to your registered email');
    } catch (err) {
      console.error('Forgot password error:', err);
      toast.error(err.message || 'Failed to send recovery email');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:to-gray-800">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          {/* <Button 
            variant="ghost" 
            onClick={() => navigate('/login')} 
            className="mb-8 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to user login
          </Button> */}

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Side - Content and Image */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Link to="/">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-teal-600 shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  </Link>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    Supplier Portal

                  </span>
                </div>
                
                
                <p className="text-lg md:text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                  Access your supplier dashboard to manage medicine orders, track deliveries, 
                  and maintain your partnership with NeuroPath.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Order Management</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track and fulfill medicine orders</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-2 rounded-lg bg-teal-500/20">
                    <Truck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Delivery Tracking</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monitor shipment status</p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl shadow-2xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2luZSUyMHN1cHBseSUyMGNoYWlufGVufDB8fHx8MTc1ODc5MDkxMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Medical supply chain"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl font-bold text-white mb-2">Reliable Supply Chain</h3>
                  <p className="text-white/90 text-sm">Ensuring timely delivery of essential medicines to patients worldwide</p>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full  max-w-md mx-auto lg:max-w-md">
              <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
                <CardHeader className="space-y-1 pb-8">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-teal-600 shadow-lg">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
                    Supplier Sign In
                  </CardTitle>
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    Access your supplier dashboard
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="supplierId" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                        Supplier ID
                      </Label>
                      <Input 
                        id="supplierId" 
                        placeholder="Enter your Supplier ID" 
                        value={supplierId} 
                        onChange={(e) => setSupplierId(e.target.value)}
                        className="h-12 rounded-2xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="password" className="text-base font-semibold text-gray-700 dark:text-gray-300">
                        Password
                      </Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 rounded-2xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500 dark:focus:border-blue-400 pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right">
                      <Button
                        type="button"
                        variant="link"
                        onClick={handleForgotPassword}
                        className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Mail className="mr-1 h-4 w-4" />
                        Forgot Password?
                      </Button>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-14 rounded-2xl font-semibold text-lg bg-gradient-to-r from-blue-500 to-teal-600 hover:from-blue-600 hover:to-teal-700 shadow-lg transition-all duration-300 transform hover:scale-105" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-5 w-5" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
