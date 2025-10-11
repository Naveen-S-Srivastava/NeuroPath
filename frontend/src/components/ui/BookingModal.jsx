import React, { useEffect, useState } from 'react';

export const BookingModal = ({ isOpen, onClose, neurologist, onBooked }) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Book with {neurologist.name}</h3>
            <p className="text-sm text-gray-500">{neurologist.specialty} • {neurologist.location} • {neurologist.fee}</p>
          </div>
          <button onClick={onClose} className="text-sm px-3 py-1 rounded bg-red-50 dark:bg-red-600 text-red-700 dark:text-white">Close</button>
        </div>
        <div className="p-4">
          <label className="block text-sm text-gray-600 mb-1">Date</label>
          <input type="date" className="w-full mb-3 px-3 py-2 rounded border" value={date} onChange={(e) => setDate(e.target.value)} />

          <label className="block text-sm text-gray-600 mb-1">Time</label>
          <input type="time" className="w-full mb-3 px-3 py-2 rounded border" value={time} onChange={(e) => {
            const t = e.target.value;
            // convert HH:MM (24h) to human-friendly 12h AM/PM when storing
            const [hh, mm] = t.split(':');
            let hour = parseInt(hh, 10);
            const suffix = hour >= 12 ? 'PM' : 'AM';
            hour = ((hour + 11) % 12) + 1;
            setTime(`${String(hour).padStart(2,'0')}:${mm} ${suffix}`);
          }} />

          <label className="block text-sm text-gray-600 mb-1">Type</label>
          <select className="w-full mb-4 px-3 py-2 rounded border" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Consultation">Consultation</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Teleconsult">Teleconsult</option>
          </select>

          <div className="flex justify-end">
            <button onClick={handleSubmit} disabled={loading} className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
