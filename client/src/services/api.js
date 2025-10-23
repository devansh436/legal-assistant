import axios from 'axios';

// Use environment variable in production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});


// User API calls
export const userAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  // Get user by ID
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update user preferences
  updatePreferences: async (userId, preferences) => {
    const response = await api.put(`/users/${userId}/preferences`, { preferences });
    return response.data;
  },
};

// Conversation API calls
export const conversationAPI = {
  // Get all conversations for user
  getUserConversations: async (userId) => {
    const response = await api.get(`/conversations/user/${userId}`);
    return response.data;
  },

  // Get specific conversation
  getConversation: async (conversationId) => {
    const response = await api.get(`/conversations/${conversationId}`);
    return response.data;
  },

  // Archive conversation
  archiveConversation: async (conversationId) => {
    const response = await api.put(`/conversations/${conversationId}/archive`);
    return response.data;
  },
};

// Update voice API URLs
export const voiceAPI = {
  transcribe: async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await axios.post(
      `${API_BASE_URL}/api/conversations/transcribe`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  processQuery: async (transcript, userId) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/conversations/process-query`,
      { transcript, userId }
    );
    return response.data;
  },

  sendAudio: async (audioBlob, userId) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('userId', userId);

    const response = await axios.post(
      `${API_BASE_URL}/api/conversations/voice-query`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};


export default api;
