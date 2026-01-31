const API_BASE_URL = 'http://localhost:8000';

export const apiClient = {
  // Authentication endpoints
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }
      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async googleAuth(googleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Google authentication failed');
      }
      return await response.json();
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  },

  // ML Scan endpoints
  async triggerMLScan(service = 'payment-service') {
    try {
      const response = await fetch(`${API_BASE_URL}/ml/scan?service=${encodeURIComponent(service)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('ML Scan error:', error);
      throw error;
    }
  },

  async getMLResults() {
    try {
      const response = await fetch(`${API_BASE_URL}/ml/results`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get ML Results error:', error);
      throw error;
    }
  },

  async getBlastRadius(service = 'auth-service') {
    try {
      const response = await fetch(`${API_BASE_URL}/ml/blast-radius?service=${encodeURIComponent(service)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Blast Radius error:', error);
      throw error;
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }
};
