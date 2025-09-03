import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import adminService from '../services/adminService';
import UserManagement from './UserManagement';
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  UsersIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon as ShieldSolidIcon } from '@heroicons/react/24/solid';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    const result = await adminService.getDashboardStats();
    if (result.success) {
      setDashboardStats(result.data);
    }
  };

  // Check if user is admin
  if (!user || !user.roles?.includes('ADMIN')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center py-12 px-4">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-600/50 p-8 max-w-md w-full text-center scale-in">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
              <ExclamationTriangleIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You need administrator privileges to access this page.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Administrative access required</span>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'upload', name: 'PDF Upload', icon: CloudArrowUpIcon },
    { id: 'users', name: 'User Management', icon: UsersIcon },
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-600/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg float">
                <ShieldSolidIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-300">Medical AI Chatbot Administration</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg">
                <p className="text-sm font-medium">Welcome, {user.name}</p>
                <p className="text-xs opacity-90">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-6">
          <nav className="flex space-x-1" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-lg border-indigo-200 dark:border-indigo-600'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  } backdrop-blur-md border border-gray-200/50 dark:border-slate-600/50 rounded-xl px-4 py-3 font-medium text-sm flex items-center space-x-2 transition-all duration-200 hover-lift`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && <PdfUploadTab />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'dashboard' && <DashboardTab stats={dashboardStats} />}
      </div>
    </div>
  );
};

// PDF Upload Tab Component
const PdfUploadTab = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files).filter(
        file => file.type === 'application/pdf'
      );
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(
        file => file.type === 'application/pdf'
      );
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadResults(null);
    
    try {
      console.log('🔄 Starting file upload process...');
      console.log('- Files to upload:', files.length);
      console.log('- Total size:', files.reduce((sum, file) => sum + file.size, 0), 'bytes');
      
      let result;
      if (files.length === 1) {
        console.log('📁 Uploading single file:', files[0].name);
        result = await adminService.uploadSinglePdf(files[0]);
      } else {
        console.log('📁 Uploading multiple files');
        result = await adminService.uploadMultiplePdfs(files);
      }
      
      console.log('📊 Upload result:', result);
      setUploadResults(result);
      
      if (result.success) {
        setFiles([]);
        console.log('✅ Upload completed successfully, cleared file list');
      } else {
        console.log('❌ Upload failed:', result.error);
        
        // Handle authentication errors specifically
        if (result.error && result.error.includes('Authentication failed')) {
          setUploadResults({
            success: false,
            error: 'Your session has expired. Please refresh the page and log in again.',
            authError: true
          });
        }
      }
    } catch (error) {
      console.error('❌ Upload process error:', error);
      setUploadResults({
        success: false,
        error: 'Upload failed: ' + error.message
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-600/50 p-8 hover-lift">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <CloudArrowUpIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Upload PDFs for RAG Database
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Upload medical documents to enhance the AI chatbot's knowledge base
            </p>
          </div>
        </div>

        {/* File Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 hover-lift ${
            dragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' 
              : 'border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50/50 dark:bg-slate-700/30'
          }`}
        >
          <div className={`transition-all duration-300 ${dragActive ? 'scale-110' : ''}`}>
            <CloudArrowUpIcon className={`h-16 w-16 mx-auto mb-4 transition-colors duration-300 ${
              dragActive ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
            }`} />
            <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Drop PDF files here, or click to select
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Support for multiple PDF files up to 50MB each
            </p>
          </div>
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl cursor-pointer hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover-lift"
          >
            <DocumentIcon className="w-5 h-5" />
            <span className="font-medium">Select Files</span>
          </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-8 scale-in">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Selected Files ({files.length})
              </h3>
            </div>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50/70 dark:bg-slate-700/50 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-slate-600/50 hover-lift">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <DocumentIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
            
            <button
              onClick={uploadFiles}
              disabled={uploading}
              className="mt-6 w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover-lift"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-5 h-5" />
                  <span className="font-medium">Upload {files.length} File{files.length !== 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Upload Results */}
        {uploadResults && (
          <div className="mt-8 scale-in">
            <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
              uploadResults.success 
                ? 'bg-green-50/70 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                : uploadResults.authError
                ? 'bg-yellow-50/70 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                : 'bg-red-50/70 dark:bg-red-900/20 border-red-200 dark:border-red-700'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  uploadResults.success 
                    ? 'bg-green-500' 
                    : uploadResults.authError
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}>
                  {uploadResults.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-white" />
                  ) : uploadResults.authError ? (
                    <ExclamationTriangleIcon className="h-5 w-5 text-white" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${
                    uploadResults.success 
                      ? 'text-green-800 dark:text-green-300' 
                      : uploadResults.authError
                      ? 'text-yellow-800 dark:text-yellow-300'
                      : 'text-red-800 dark:text-red-300'
                  }`}>
                    {uploadResults.message || uploadResults.error}
                  </p>
                  
                  {uploadResults.authError && (
                    <div className="mt-3">
                      <button
                        onClick={() => window.location.reload()}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                      >
                        Refresh Page & Login Again
                      </button>
                    </div>
                  )}
                  
                  {!uploadResults.success && !uploadResults.authError && uploadResults.error?.includes('timeout') && (
                    <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                      <p>💡 Tips for large files:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Try uploading smaller files (under 10MB)</li>
                        <li>Check your internet connection</li>
                        <li>Ensure the PDF is not corrupted</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              {uploadResults.success && uploadResults.data?.results && (
                <div className="mt-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3">Upload Details:</h4>
                  <div className="space-y-2">
                    {uploadResults.data.results.map((result, index) => (
                      <div key={index} className="flex items-center text-sm bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg">
                        <span className="w-6 h-6 mr-3 text-lg">
                          {result.status === 'success' ? '✅' : '❌'}
                        </span>
                        <span className="font-medium mr-2">{result.filename}:</span>
                        <span className={result.status === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                          {result.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Dashboard Tab Component
const DashboardTab = ({ stats }) => {
  return (
    <div className="space-y-6 fade-in">
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-600/50 p-8 hover-lift">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <ChartBarIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Overview</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 hover-lift transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg float">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Vector Store</p>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {stats?.vectorStoreStatus || (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Loading...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200/50 dark:border-green-700/50 hover-lift transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg float">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-300">System Status</p>
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {stats?.systemStatus || (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Loading...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-700/50 hover-lift transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg float">
                <DocumentIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-300">Last Update</p>
                <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                  {stats?.lastUpdate ? new Date(stats.lastUpdate).toLocaleString() : (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Loading...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-2xl border border-orange-200/50 dark:border-orange-700/50 hover-lift">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Performance</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Response Accuracy</span>
                <span className="font-semibold text-orange-700 dark:text-orange-400">95.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Avg Response Time</span>
                <span className="font-semibold text-orange-700 dark:text-orange-400">1.2s</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-6 rounded-2xl border border-teal-200/50 dark:border-teal-700/50 hover-lift">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <CogIcon className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Health</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Uptime</span>
                <span className="font-semibold text-teal-700 dark:text-teal-400">99.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Memory Usage</span>
                <span className="font-semibold text-teal-700 dark:text-teal-400">67%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
