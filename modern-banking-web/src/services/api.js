import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const SERVICE_BASE_URL = import.meta.env.VITE_SERVICE_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const processMessage = async (text, customerId) => {
  try {
    const response = await api.post('/process-text', { text, user_id: customerId.toString() });
    return response.data;
  } catch (error) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to process message');
  }
};

export const submitMissingParameters = async (moduleId, subModule, parameters) => {
  try {
    const response = await api.post('/complete-action', {
      module: moduleId,
      sub_module: subModule,
      parameters,
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to submit parameters');
  }
};

export const processSmartText = async ({ user_id, text, is_new_session }) => {
  try {
    const response = await api.post('/process-smart-text', {
      user_id: user_id.toString(),
      text: text,
      is_new_session: is_new_session.toString()
    });
    return response.data;
  } catch (error) {
    console.error('Error processing smart text:', error);
    throw error;
  }
}; 

   