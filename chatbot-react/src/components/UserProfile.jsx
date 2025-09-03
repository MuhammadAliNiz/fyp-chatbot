import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PasswordChangeForm from './PasswordChangeForm';
import { 
  UserIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon, 
  IdentificationIcon,
  CalendarDaysIcon,
  KeyIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const UserProfile = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {showPasswordChange ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                <button
                  onClick={() => setShowPasswordChange(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Back to Profile
                </button>
              </div>
              <PasswordChangeForm onSuccess={() => setShowPasswordChange(false)} />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Picture & Basic Info */}
              <div className="flex items-start space-x-6">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{user?.name}</h3>
                  <p className="text-gray-500">{user?.email}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user?.roles?.map(role => (
                      <span 
                        key={role}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          role === 'ADMIN' 
                            ? 'bg-red-100 text-red-800' 
                            : role === 'MODERATOR'
                            ? 'bg-purple-100 text-purple-800'
                            : role === 'MEDICAL_PROFESSIONAL'
                            ? 'bg-green-100 text-green-800'
                            : role === 'RESEARCHER'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <UserIcon className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <p className="mt-1 text-sm text-gray-900">{user?.name || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email Address</label>
                      <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <IdentificationIcon className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">User ID</label>
                      <p className="mt-1 text-sm text-gray-500 font-mono">{user?.id}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <ShieldCheckIcon className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Status</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user?.enabled 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user?.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CalendarDaysIcon className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Created</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(user?.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CalendarDaysIcon className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(user?.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <KeyIcon className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <span>Close</span>
                  </button>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-400 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Security Notice</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your personal information is protected and encrypted. For security reasons, 
                      some account changes may require administrator approval.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
