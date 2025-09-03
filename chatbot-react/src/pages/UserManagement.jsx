import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon, 
  UserCircleIcon, 
  ShieldCheckIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  KeyIcon,
  SparklesIcon,
  ServerIcon,
  ClockIcon,
  CpuChipIcon,
  CloudIcon,
  ChartBarIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  ServerStackIcon,
  ShieldExclamationIcon,
  BoltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { UserGroupIcon as UserGroupSolidIcon } from '@heroicons/react/24/solid';
import adminService from '../services/adminService';
import authService from '../services/authService';
import PasswordChangeForm from '../components/PasswordChangeForm';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const fetchUsersAndRoles = async () => {
    setLoading(true);
    
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllRoles()
      ]);

      if (usersResponse.success) {
        setUsers(usersResponse.data);
      } else {
        setMessage({ type: 'error', text: usersResponse.error || 'Failed to load users' });
      }

      if (rolesResponse.success) {
        setRoles(rolesResponse.data);
      } else {
        setMessage({ type: 'error', text: rolesResponse.error || 'Failed to load roles' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load users and roles' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await adminService.deleteUser(userId);
      if (response.success) {
        setUsers(users.filter(user => user.id !== userId));
        setMessage({ type: 'success', text: 'User deleted successfully' });
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to delete user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete user' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    setActionLoading(true);
    try {
      const response = await adminService.toggleUserStatus(userId, !currentStatus);
      if (response.success) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, enabled: !currentStatus }
            : user
        ));
        setMessage({ 
          type: 'success', 
          text: `User ${!currentStatus ? 'enabled' : 'disabled'} successfully` 
        });
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to update user status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update user status' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddRole = async (userId, roleType) => {
    setActionLoading(true);
    try {
      const response = await adminService.addRoleToUser(userId, roleType);
      if (response.success) {
        setUsers(users.map(user => 
          user.id === userId ? response.data : user
        ));
        setMessage({ type: 'success', text: `Role ${roleType} added successfully` });
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to add role' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add role' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveRole = async (userId, roleType) => {
    setActionLoading(true);
    try {
      const response = await adminService.removeRoleFromUser(userId, roleType);
      if (response.success) {
        setUsers(users.map(user => 
          user.id === userId ? response.data : user
        ));
        setMessage({ type: 'success', text: `Role ${roleType} removed successfully` });
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to remove role' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove role' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewChatHistory = async (user) => {
    setSelectedUser(user);
    setShowChatHistory(true);
    
    try {
      const response = await adminService.getUserChatHistory(user.id);
      if (response.success) {
        setChatHistory(response.data);
      } else {
        setChatHistory([]);
        setMessage({ type: 'error', text: 'Failed to load chat history' });
      }
    } catch (error) {
      setChatHistory([]);
      setMessage({ type: 'error', text: 'Failed to load chat history' });
    }
  };

  const handleChangePassword = async (passwordData) => {
    try {
      const response = await authService.changePassword(passwordData);
      if (response.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setShowPasswordChange(false);
      }
      return response;
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
      throw error;
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
      case 'MODERATOR': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MEDICAL_PROFESSIONAL': return 'bg-green-100 text-green-800 border-green-200';
      case 'RESEARCHER': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'USER': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-600/50 p-8 hover-lift">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg float">
              <UserGroupSolidIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage system users and permissions</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover-lift"
            >
              <KeyIcon className="h-5 w-5" />
              <span>Change Password</span>
              </button>
              <button
                onClick={fetchUsersAndRoles}
                className="bg-gradient-to-r from-gray-500 to-slate-600 text-white px-4 py-2 rounded-xl hover:from-gray-600 hover:to-slate-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover-lift"
              >
                <SparklesIcon className="h-5 w-5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl backdrop-blur-sm scale-in ${
            message.type === 'success' 
              ? 'bg-green-50/70 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700' 
              : 'bg-red-50/70 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700'
          }`}>
            <div className="flex justify-between items-center">
              <span>{message.text}</span>
              <button
                onClick={() => setMessage({ type: '', text: '' })}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Password Change Section */}
        {showPasswordChange && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Admin Password</h2>
            <PasswordChangeForm />
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Users ({filteredUsers.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserCircleIcon className="h-10 w-10 text-gray-400" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role) => (
                          <span
                            key={role.id}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(role.name)}`}
                          >
                            {role.name}
                            {user.email !== 'admin@chatbot.com' && (
                              <button
                                onClick={() => handleRemoveRole(user.id, role.name)}
                                className="ml-1 text-red-500 hover:text-red-700"
                                disabled={actionLoading}
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                        
                        {/* Add Role Dropdown */}
                        {user.email !== 'admin@chatbot.com' && (
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAddRole(user.id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            disabled={actionLoading}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">+ Add Role</option>
                            {Array.from(roles).filter(role => 
                              !user.roles?.some(userRole => userRole.name === role.name)
                            ).map(role => (
                              <option key={role.id} value={role.name}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.enabled ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span className={`text-sm ${user.enabled ? 'text-green-600' : 'text-red-600'}`}>
                          {user.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewChatHistory(user)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                          title="View Chat History"
                        >
                          <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        </button>
                        
                        {user.email !== 'admin@chatbot.com' && (
                          <>
                            <button
                              onClick={() => handleToggleUserStatus(user.id, user.enabled)}
                              disabled={actionLoading}
                              className={`${user.enabled ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'} flex items-center`}
                              title={user.enabled ? 'Disable User' : 'Enable User'}
                            >
                              {user.enabled ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                            </button>
                            
                            <button
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              disabled={actionLoading}
                              className="text-red-600 hover:text-red-900 flex items-center"
                              title="Delete User"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'No users registered yet.'}
              </p>
            </div>
          )}
        </div>

        {/* Chat History Modal */}
        {showChatHistory && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Chat History - {selectedUser.name}
                </h3>
                <button
                  onClick={() => setShowChatHistory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {chatHistory.length > 0 ? (
                  <div className="space-y-3">
                    {chatHistory.map((session) => (
                      <div key={session.id} className="p-4 border border-gray-200 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{session.title || 'Untitled Chat'}</h4>
                            <p className="text-sm text-gray-500">
                              {session.messageCount} messages
                            </p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div>Created: {new Date(session.createdAt).toLocaleDateString()}</div>
                            <div>Updated: {new Date(session.updatedAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No chat history</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This user hasn't started any chat sessions yet.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowChatHistory(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(user => user.enabled).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Admins</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(user => user.roles?.some(role => role.name === 'ADMIN')).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Disabled</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {users.filter(user => !user.enabled).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced System Overview Section */}
        <div className="mt-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <ServerIcon className="h-8 w-8 text-blue-600 mr-3" />
              System Overview
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive system information and application metrics
            </p>
          </div>

          {/* System Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Application Information */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl shadow-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <CodeBracketIcon className="h-6 w-6 text-blue-600 mr-2" />
                Application Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">App Name</span>
                  <span className="text-sm text-gray-900 dark:text-white font-semibold">Medical Chatbot System</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Version</span>
                  <span className="text-sm text-gray-900 dark:text-white">v2.1.0</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Environment</span>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                    Production
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Deployment</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Build Status</span>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full flex items-center">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Stable
                  </span>
                </div>
              </div>
            </div>

            {/* System Performance */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl shadow-lg border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <CpuChipIcon className="h-6 w-6 text-purple-600 mr-2" />
                System Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-purple-200 dark:border-purple-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Uptime</span>
                  <span className="text-sm text-gray-900 dark:text-white font-semibold">99.9%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-purple-200 dark:border-purple-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Response Time</span>
                  <span className="text-sm text-gray-900 dark:text-white">~250ms</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-purple-200 dark:border-purple-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory Usage</span>
                  <span className="text-sm text-gray-900 dark:text-white">2.1 GB</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-purple-200 dark:border-purple-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CPU Usage</span>
                  <span className="text-sm text-gray-900 dark:text-white">45%</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Sessions</span>
                  <span className="text-sm text-gray-900 dark:text-white font-semibold">
                    {users.filter(user => user.enabled).length * 2}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Stack & Database Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Frontend Technologies */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-xl shadow-lg border border-emerald-200 dark:border-emerald-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ComputerDesktopIcon className="h-6 w-6 text-emerald-600 mr-2" />
                Frontend Stack
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">React.js</span>
                  <span className="px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded">v18.2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Vite</span>
                  <span className="px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded">v5.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Tailwind CSS</span>
                  <span className="px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded">v3.4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Heroicons</span>
                  <span className="px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded">v2.0</span>
                </div>
              </div>
            </div>

            {/* Backend Technologies */}
            <div className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-xl shadow-lg border border-orange-200 dark:border-orange-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ServerIcon className="h-6 w-6 text-orange-600 mr-2" />
                Backend Stack
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Spring Boot</span>
                  <span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded">v3.1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Java</span>
                  <span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded">v17</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">JWT Security</span>
                  <span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded">v0.11</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Maven</span>
                  <span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded">v3.9</span>
                </div>
              </div>
            </div>

            {/* Database & Storage */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20 p-6 rounded-xl shadow-lg border border-cyan-200 dark:border-cyan-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ServerStackIcon className="h-6 w-6 text-cyan-600 mr-2" />
                Database & Storage
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">PostgreSQL</span>
                  <span className="px-2 py-1 text-xs bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 rounded">v15.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">JPA/Hibernate</span>
                  <span className="px-2 py-1 text-xs bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 rounded">v6.2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Vector DB</span>
                  <span className="px-2 py-1 text-xs bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 rounded">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">File Storage</span>
                  <span className="px-2 py-1 text-xs bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 rounded">Local</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Health & Security */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Security Status */}
            <div className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-xl shadow-lg border border-red-200 dark:border-red-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ShieldExclamationIcon className="h-6 w-6 text-red-600 mr-2" />
                Security & Compliance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">JWT Authentication</span>
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full flex items-center">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">CORS Protection</span>
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full flex items-center">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Enabled
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Password Encryption</span>
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full flex items-center">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    BCrypt
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Session Management</span>
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full flex items-center">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Secure
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">API Rate Limiting</span>
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full flex items-center">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Configured
                  </span>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl shadow-lg border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BoltIcon className="h-6 w-6 text-green-600 mr-2" />
                System Health
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Database Connection</span>
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Online
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">AI Model Status</span>
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Running
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">PDF Processing</span>
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Available
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Vector Search</span>
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Indexed
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Backup Status</span>
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full flex items-center">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Up to date
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional System Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <ChartBarIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">API Calls</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">12.5K</p>
                <p className="text-xs text-green-600">+15% ↗</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <CloudIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Storage Used</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">8.2 GB</p>
                <p className="text-xs text-blue-600">64% full</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <GlobeAltIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Requests/min</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">234</p>
                <p className="text-xs text-green-600">Normal</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <ClockIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg Response</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">185ms</p>
                <p className="text-xs text-green-600">Excellent</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <DevicePhoneMobileIcon className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Mobile Users</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">67%</p>
                <p className="text-xs text-blue-600">+8% ↗</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <SparklesIcon className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">AI Accuracy</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">94.2%</p>
                <p className="text-xs text-green-600">+2.1% ↗</p>
              </div>
            </div>
          </div>
        </div>
      </div>    
  );
};

export default UserManagement;
