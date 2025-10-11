import React, { useEffect, useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { CustomDatePicker } from './CustomDatePicker';
import { useThemeToggle } from '../hooks/useTheme';
import { 
  Calendar, 
  Clock, 
  X, 
  User, 
  MapPin, 
  DollarSign,
  Sparkles,
  Loader2
} from 'lucide-react';

export const BookingModal = ({ isOpen, onClose, neurologist, onBooked }) => {
  const { isDarkMode } = useThemeToggle();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [type, setType] = useState('Consultation');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setDate('');
      setTime('10:00 AM');
      setType('Consultation');
    }
  }, [isOpen]);

  if (!isOpen || !neurologist) return null;

  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : 'http://localhost:5000';

  const handleSubmit = async () => {
    if (!date || !time) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('neuropath_token');
      const res = await fetch(`${API_BASE}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ neurologistId: neurologist._id, date, time, type })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Booking failed');
      onBooked && onBooked(data.appointment);
      onClose();
    } catch (err) {
      console.error('Booking error:', err);
      alert(err.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
  ];

  const appointmentTypes = [
    { value: 'Consultation', label: 'Consultation', description: 'Initial consultation' },
    { value: 'Follow-up', label: 'Follow-up', description: 'Follow-up appointment' },
    { value: 'Teleconsult', label: 'Teleconsult', description: 'Video consultation' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className={`relative w-full max-w-lg mx-auto rounded-3xl shadow-2xl transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-900 border border-white/10' 
          : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-white/10 bg-gradient-to-r from-gray-800 to-gray-900' : 'border-gray-200 bg-gradient-to-r from-blue-50 to-teal-50'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Book with {neurologist.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                        {neurologist.location}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                        {neurologist.fee}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={`h-8 w-8 p-0 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 ${
                isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date Selection */}
          <div className="space-y-3">
            <Label className={`text-base font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-700'
            }`}>
              Select Date
            </Label>
            <CustomDatePicker
              value={date}
              onChange={setDate}
              minDate={new Date().toISOString().split('T')[0]}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Time Selection */}
          <div className="space-y-3">
            <Label className={`text-base font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-700'
            }`}>
              Select Time
            </Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger className={`h-12 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
                isDarkMode 
                  ? 'border-white/20 bg-white/5 hover:bg-white/10 focus:border-white/40' 
                  : 'border-gray-300 bg-white hover:bg-gray-50 focus:border-blue-500'
              }`}>
                <SelectValue placeholder="Choose time slot" />
              </SelectTrigger>
              <SelectContent className={`backdrop-blur-xl ${
                isDarkMode ? 'bg-gray-800 border-white/20' : 'bg-white border-gray-200'
              }`}>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>{slot}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Appointment Type */}
          <div className="space-y-3">
            <Label className={`text-base font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-700'
            }`}>
              Appointment Type
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className={`h-12 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
                isDarkMode 
                  ? 'border-white/20 bg-white/5 hover:bg-white/10 focus:border-white/40' 
                  : 'border-gray-300 bg-white hover:bg-gray-50 focus:border-blue-500'
              }`}>
                <SelectValue placeholder="Select appointment type" />
              </SelectTrigger>
              <SelectContent className={`backdrop-blur-xl ${
                isDarkMode ? 'bg-gray-800 border-white/20' : 'bg-white border-gray-200'
              }`}>
                {appointmentTypes.map((appointmentType) => (
                  <SelectItem key={appointmentType.value} value={appointmentType.value} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <div className="flex flex-col">
                      <span className="font-medium">{appointmentType.label}</span>
                      <span className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {appointmentType.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className={`flex-1 h-12 rounded-2xl border-2 transition-all duration-300 ${
                isDarkMode 
                  ? 'border-white/20 text-white hover:bg-white/10' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !date || !time}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Confirm Booking
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
