import { api } from './authService';

const pdfService = {
  // Upload PDF file (Admin only)
  async uploadPdf(file, progressCallback = null) {
    try {
      console.log('🔄 PDF Upload Start - File Details:');
      console.log('- File name:', file.name);
      console.log('- File size:', file.size, 'bytes');
      console.log('- File type:', file.type);
      console.log('- Last modified:', new Date(file.lastModified));

      const formData = new FormData();
      formData.append('file', file);

      console.log('📝 FormData created, appended file as "file" parameter');

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (progressCallback) {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log('📈 Upload Progress:', percentCompleted + '%');
          progressCallback(percentCompleted);
        };
      }

      console.log('🚀 Making API call to /api/pdf/upload...');
      console.log('- Config:', config);

      const response = await api.post('/api/pdf/upload', formData, config);

      console.log('✅ Upload Response received:');
      console.log('- Status:', response.status);
      console.log('- Response data:', response.data);

      return { 
        success: response.data.success, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ PDF Upload Error:');
      console.error('- Error object:', error);
      console.error('- Error message:', error.message);
      console.error('- Response status:', error.response?.status);
      console.error('- Response data:', error.response?.data);
      console.error('- Response headers:', error.response?.headers);
      console.error('- Request config:', error.config);

      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload PDF'
      };
    }
  },

  // Get upload status
  async getUploadStatus() {
    try {
      const response = await api.get('/api/pdf/status');
      return { 
        success: response.data.success, 
        data: response.data.data 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get upload status'
      };
    }
  },

  // Get uploaded documents list
  async getDocuments() {
    try {
      const response = await api.get('/api/pdf/documents');
      return { 
        success: response.data.success, 
        data: response.data.data 
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get documents'
      };
    }
  }
};

export default pdfService;
