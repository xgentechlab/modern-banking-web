import axios from 'axios';
const SERVICE_BASE_URL = import.meta.env.VITE_SERVICE_URL || 'http://localhost:3000';

export const getUserCards = async (userId, filters  ) => {
    const response = await axios.get(`${SERVICE_BASE_URL}/api/cards/user/${userId}`, { params: filters });
    return response.data;
};



