import React from 'react';
import { AuthProvider } from './components/context/AuthContext';
import { AppRouter } from './components/routing/AppRouter';
import { Toaster } from './components/ui/sonner';

const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster position="top-right" />
    </AuthProvider>
  );
};

export default App;