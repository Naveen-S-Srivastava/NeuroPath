import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

export const SupplierDashboard = () => {
  const [supplier, setSupplier] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(new Set());
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [customStatus, setCustomStatus] = useState({});
  const [customNote, setCustomNote] = useState({});

  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : 'http://localhost:5000';

  const token = typeof window !== 'undefined' ? localStorage.getItem('supplier_token') : null;

  const fetchMe = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/suppliers/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Not authenticated');
      const data = await res.json();
      setSupplier(data.supplier);
    } catch (err) {
      console.error(err);
      setSupplier(null);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/suppliers/orders`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Fetch orders error:', err);
      toast.error(err.message || 'Failed to fetch orders');
    }
  };

  useEffect(() => {
    (async () => {
      await fetchMe();
      await fetchOrders();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (orderId, status, isMainStatus = false) => {
    if (!token) {
      toast.error('Not authenticated. Please login again.');
      return;
    }
    
    // Prevent multiple simultaneous updates for the same order
    if (updating.has(orderId)) {
      return;
    }
    
    setUpdating(prev => new Set(prev).add(orderId));
    
    try {
      const note = customNote[orderId] || '';
      console.log('Updating status:', { orderId, status, note, isMainStatus });
      
      const res = await fetch(`${API_BASE}/api/suppliers/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, note, isMainStatus })
      });
      
      console.log('Response status:', res.status);
      const data = await res.json().catch(() => ({}));
      console.log('Response data:', data);
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          toast.error('Authentication failed. Please login again.');
          localStorage.removeItem('supplier_token');
          localStorage.removeItem('supplier_user');
          window.location.reload();
          return;
        }
        throw new Error(data.message || `HTTP ${res.status}: ${data.error || 'Unknown error'}`);
      }
      
      toast.success(data.message || 'Status updated');
      // Clear the custom note and status after successful update
      setCustomNote(prev => ({ ...prev, [orderId]: '' }));
      setCustomStatus(prev => ({ ...prev, [orderId]: '' }));
      
      // Refresh orders after a short delay to avoid race conditions
      setTimeout(() => fetchOrders(), 500);
    } catch (err) {
      console.error('Update status error:', err);
      toast.error(`Failed to update status: ${err.message}`);
    } finally {
      setUpdating(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
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

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <Card className="border-0 shadow-sm max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="mb-4">Please login as supplier</p>
            <Button onClick={() => window.location.assign('/supplier-login')}>Go to Supplier Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading supplier dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {supplier?.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage approved prescriptions and deliveries</p>
          </div>
          <Button variant="outline" onClick={() => { localStorage.removeItem('supplier_token'); localStorage.removeItem('supplier_user'); window.location.reload(); }}>Logout</Button>
        </div>

        <div className="grid gap-6">
          {orders.map(order => (
            <Card key={order._id} className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order #{order._id.slice(-6)}</span>
                  <Badge 
                    variant={order.status === 'delivered' ? 'default' : 'outline'} 
                    className={`capitalize ${order.status === 'delivered' ? 'bg-green-100 text-green-800 border-green-200' : ''}`}
                  >
                    {order.status.replaceAll('_', ' ')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Patient</div>
                    <div className="font-medium">{order.patientId?.name}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Delivery Address</div>
                    <div className="font-medium">{order.deliveryAddress || '—'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Uploaded File</div>
                    <a href={order.url} target="_blank" rel="noreferrer" className="text-blue-600">View</a>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {order.status === 'forwarded_to_supplier' && (
                    <Button 
                      variant="outline" 
                      onClick={() => updateStatus(order._id, 'processing', true)}
                      disabled={updating.has(order._id)}
                    >
                      {updating.has(order._id) ? 'Updating...' : 'Mark Processing'}
                    </Button>
                  )}
                  {order.status === 'processing' && (
                    <Button 
                      variant="outline" 
                      onClick={() => updateStatus(order._id, 'shipped', true)}
                      disabled={updating.has(order._id)}
                    >
                      {updating.has(order._id) ? 'Updating...' : 'Mark Shipped'}
                    </Button>
                  )}
                  {order.status === 'shipped' && (
                    <Button 
                      className="bg-green-600 hover:bg-green-700" 
                      onClick={() => updateStatus(order._id, 'delivered', true)}
                      disabled={updating.has(order._id)}
                    >
                      {updating.has(order._id) ? 'Updating...' : 'Mark Delivered'}
                    </Button>
                  )}
                  {order.status === 'delivered' && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">Delivered ✓</Badge>
                  )}
                </div>

                {/* Custom Status Update - Available when not delivered */}
                {order.status !== 'delivered' && (
                  <div className="border-t pt-4">
                    <div className="text-sm font-semibold mb-2">Add Update or Note</div>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter status update (e.g., 'Out for delivery', 'Delayed due to weather')"
                        value={customStatus[order._id] || ''}
                        onChange={(e) => setCustomStatus(prev => ({ ...prev, [order._id]: e.target.value }))}
                        className="flex-1"
                        disabled={updating.has(order._id)}
                      />
                      <Textarea
                        placeholder="Add additional note (optional)"
                        value={customNote[order._id] || ''}
                        onChange={(e) => setCustomNote(prev => ({ ...prev, [order._id]: e.target.value }))}
                        className="flex-1"
                        rows={2}
                        disabled={updating.has(order._id)}
                      />
                      <Button
                        onClick={async () => {
                          const status = customStatus[order._id]?.trim();
                          if (status && status.length > 0) {
                            await updateStatus(order._id, status.toLowerCase().replace(/\s+/g, '_'), false);
                            setCustomStatus(prev => ({ ...prev, [order._id]: '' }));
                          }
                        }}
                        disabled={!customStatus[order._id]?.trim() || updating.has(order._id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {updating.has(order._id) ? 'Updating...' : <><Plus className="h-4 w-4 mr-1" />Add</>}
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Use this to add tracking updates, delivery notes, or any additional information about this order.
                    </div>
                  </div>
                )}                {/* Collapsible Tracking Section */}
                <div className="border-t pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => toggleExpanded(order._id)}
                    className="w-full justify-between p-0 h-auto font-semibold"
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
                      {(order.timeline || []).map((u, idx) => {
                        const isNote = u.status.startsWith('note:');
                        const displayStatus = isNote ? u.status.replace('note: ', '') : u.status.replaceAll('_', ' ');
                        const isMainStatus = ['processing', 'shipped', 'delivered'].includes(u.status);
                        
                        return (
                          <div key={idx} className={`flex items-center justify-between text-sm p-3 border rounded ${
                            isMainStatus ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 
                            'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                          }`}>
                            <div className="flex items-center space-x-2">
                              {isMainStatus && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                              {isNote && <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
                              <span className={`capitalize ${isMainStatus ? 'font-semibold text-blue-700 dark:text-blue-300' : ''}`}>
                                {displayStatus}
                              </span>
                              {isNote && <span className="text-xs text-gray-500">(Note)</span>}
                            </div>
                            <div className="text-gray-500 text-right">
                              <div>{u.at ? new Date(u.at).toLocaleString() : 'Date not available'}</div>
                              {u.note && u.note !== 'Status updated' && u.note !== 'Note added' && (
                                <div className="text-xs text-gray-400 mt-1 max-w-48 truncate" title={u.note}>
                                  {u.note}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {(order.timeline || []).length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">No tracking updates yet</div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {orders.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center text-gray-500">No assigned orders yet</CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
