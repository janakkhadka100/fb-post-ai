/**
 * Error handling utilities
 */

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.error || error.message;
    
    if (status === 404) {
      return {
        message: 'Backend API not found. Please ensure the backend is deployed and VITE_API_URL is set correctly.',
        status,
        isBackendMissing: true,
      };
    }
    
    if (status === 500) {
      return {
        message: 'Server error. Please check backend logs.',
        status,
      };
    }
    
    return {
      message: message || `Request failed with status code ${status}`,
      status,
    };
  }
  
  if (error.request) {
    // Request made but no response
    return {
      message: 'Cannot connect to backend. Please check if backend is running and VITE_API_URL is correct.',
      isConnectionError: true,
    };
  }
  
  // Something else happened
  return {
    message: error.message || 'An unexpected error occurred',
  };
};

export const getBackendUrl = () => {
  return import.meta.env.VITE_API_URL || '/api';
};

export const isBackendConfigured = () => {
  const url = import.meta.env.VITE_API_URL;
  return url && url !== '/api' && !url.includes('localhost');
};

