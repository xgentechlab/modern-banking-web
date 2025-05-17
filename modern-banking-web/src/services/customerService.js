import axios from 'axios';
const SERVICE_BASE_URL = import.meta.env.VITE_SERVICE_URL || 'http://localhost:3000';

export const getCustomer360Data = async (customerId) => {
  try {
    const response = await axios.get(`${SERVICE_BASE_URL}/api/customer360/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer data:', error);
    throw error;
  }
}; 