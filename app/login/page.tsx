'use client';

import React from 'react';
import Login from '@/components/Login';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { state } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (state.isAuthenticated && state.user) {
      router.push('/');
    }
  }, [state.isAuthenticated, state.user, router]);

  const handleLoginSuccess = () => {
    router.push('/');
  };

  // Show loading while checking auth state
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Don't render login if already authenticated
  if (state.isAuthenticated && state.user) {
    return null;
  }

  return <Login onLoginSuccess={handleLoginSuccess} />;
}
