import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

export const CustomDatePicker = ({ value, onChange, minDate, isDarkMode, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
      setCurrentMonth(new Date(value));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const calendarHeight = 400; // Approximate height of calendar
      
      setOpenUpward(spaceBelow < calendarHeight && spaceAbove > spaceBelow);
    }
  };

  const handleOpen = () => {
    checkPosition();
    setIsOpen(true);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date) => {
    if (!minDate) return false;
    return date < new Date(minDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const handleDateSelect = (date) => {
    if (isDateDisabled(date)) return;
    setSelectedDate(date);
    onChange(date.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    if (!isDateDisabled(today)) {
      setSelectedDate(today);
      onChange(today.toISOString().split('T')[0]);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Previous month days
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i);
      days.push(
        <button
          key={`prev-${i}`}
          className={`w-8 h-8 text-xs rounded-full ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}
          disabled
        >
          {date.getDate()}
        </button>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const disabled = isDateDisabled(date);
      const isSelectedDate = isSelected(date);
      const isTodayDate = isToday(date);

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(date)}
          disabled={disabled}
          className={`w-8 h-8 text-sm rounded-full transition-all duration-200 ${
            disabled
              ? `${isDarkMode ? 'text-gray-600' : 'text-gray-300'} cursor-not-allowed`
              : isSelectedDate
              ? 'bg-blue-500 text-white shadow-lg transform scale-110'
              : isTodayDate
              ? `bg-blue-100 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'} font-semibold`
              : `hover:bg-blue-50 ${isDarkMode ? 'text-white hover:text-blue-300' : 'text-gray-700 hover:text-blue-600'}`
          }`}
        >
          {day}
        </button>
      );
    }

    // Next month days
    const totalCells = 42; // 6 rows × 7 days
    const remainingCells = totalCells - days.length;
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i);
      days.push(
        <button
          key={`next-${i}`}
          className={`w-8 h-8 text-xs rounded-full ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}
          disabled
        >
          {date.getDate()}
        </button>
      );
    }

    return days;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative" ref={inputRef}>
        <input
          type="text"
          value={formatDate(selectedDate)}
          onChange={() => {}} // Controlled by calendar
          onClick={handleOpen}
          placeholder="mm/dd/yyyy"
          className={`w-full h-12 rounded-2xl backdrop-blur-sm border transition-all duration-300 text-base cursor-pointer ${
            isDarkMode 
              ? 'border-white/20 bg-white/5 hover:bg-white/10 focus:border-white/40 text-white placeholder-gray-400' 
              : 'border-gray-300 bg-white hover:bg-gray-50 focus:border-blue-500 text-gray-900 placeholder-gray-500'
          }`}
          readOnly
        />
        <Calendar className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`} />
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className={`absolute left-0 w-80 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl z-[9999] ${
          openUpward 
            ? 'bottom-full mb-2' 
            : 'top-full mt-2'
        } ${
          isDarkMode 
            ? 'bg-gray-800 border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth(-1)}
              className={`h-8 w-8 p-0 rounded-full ${
                isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth(1)}
              className={`h-8 w-8 p-0 rounded-full ${
                isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className={`text-center text-xs font-medium py-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {renderCalendar()}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedDate(null);
                onChange('');
                setIsOpen(false);
              }}
              className={`text-sm ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className={`text-sm ${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              Today
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
