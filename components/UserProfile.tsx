'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfileProps {
  onClose?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { state, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = React.useCallback(async () => {
    await logout();
    if (onClose) {
      onClose();
    }
  }, [logout, onClose]);

  const toggleDropdown = React.useCallback(() => {
    setShowDropdown(prev => !prev);
  }, []);

  const closeDropdown = React.useCallback(() => {
    setShowDropdown(false);
  }, []);

  const getRoleDisplayName = React.useCallback((role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'cashier': return 'Kasir';
      default: return role;
    }
  }, []);

  const getRoleBadgeColor = React.useCallback((role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'cashier': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const userInitial = React.useMemo(() => {
    if (!state.user) return '';
    return state.user.fullName 
      ? state.user.fullName.charAt(0).toUpperCase() 
      : state.user.username.charAt(0).toUpperCase();
  }, [state.user]);

  const displayName = React.useMemo(() => {
    if (!state.user) return '';
    return state.user.fullName || state.user.username;
  }, [state.user]);

  const roleDisplayName = React.useMemo(() => {
    if (!state.user) return '';
    return getRoleDisplayName(state.user.role);
  }, [state.user, getRoleDisplayName]);

  const roleBadgeColor = React.useMemo(() => {
    if (!state.user) return '';
    return getRoleBadgeColor(state.user.role);
  }, [state.user, getRoleBadgeColor]);

  if (!state.user) return null;

  return (
    <div className="relative">
      {/* User Menu Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {userInitial}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-gray-900 truncate">
            {displayName}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {roleDisplayName}
          </p>
        </div>
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-lg font-medium text-white">
                  {userInitial}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  @{state.user.username}
                </p>
                {state.user.email && (
                  <p className="text-xs text-gray-500 truncate">
                    {state.user.email}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeColor}`}>
                {roleDisplayName}
              </span>
            </div>
          </div>

          {/* User Details */}
          <div className="p-4 border-b border-gray-200">
            <dl className="space-y-2">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">User ID</dt>
                <dd className="text-sm text-gray-900 font-mono">{state.user.id.slice(0, 8)}...</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</dt>
                <dd className="text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${state.user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {state.user.isActive ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bergabung</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(state.user.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
              {state.user.lastLoginAt && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Login Terakhir</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(state.user.lastLoginAt).toLocaleString('id-ID', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Actions */}
          <div className="p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
            >
              <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeDropdown}
        />
      )}
    </div>
  );
};

export default UserProfile;
