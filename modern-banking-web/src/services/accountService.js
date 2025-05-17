import axios from 'axios';

const SERVICE_BASE_URL = import.meta.env.VITE_SERVICE_URL || 'http://localhost:3000';

export const getAccounts = async (userId, filters) => {
  const response = await axios.get(`${SERVICE_BASE_URL}/api/accounts/user/${userId}`, { params: filters });
  return response.data;
};

export const getAccountDetails = async (userId, filters) => {
  const response = await axios.get(`${SERVICE_BASE_URL}/api/accounts/${userId}`, { params: filters });
  return response.data.account;
};



