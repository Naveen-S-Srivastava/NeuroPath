import React, { useEffect, useState } from 'react';

export const BackendHealth = () => {
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : 'http://localhost:5000';
  const [status, setStatus] = useState('unknown');
  const [message, setMessage] = useState('Not checked');
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const check = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setStatus('ok');
      setMessage(data.message || 'OK');
    } catch (err) {
      setStatus('fail');
      setMessage(err.message || 'Failed to reach backend');
    } finally {
      setLoading(false);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mb-4 flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border">
      <div className="flex items-center space-x-3">
        <div className={`h-3 w-3 rounded-full ${status === 'ok' ? 'bg-green-500' : status === 'fail' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">Backend status</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{loading ? 'Checking…' : message}</div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="text-xs text-gray-400">{lastChecked ? `Last: ${lastChecked.toLocaleTimeString()}` : ''}</div>
        <button
          type="button"
          onClick={check}
          className="inline-flex items-center px-3 py-1.5 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading ? 'Checking…' : 'Check'}
        </button>
      </div>
    </div>
  );
};
