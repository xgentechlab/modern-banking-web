import axios from 'axios';

const SERVICE_BASE_URL = import.meta.env.VITE_SERVICE_URL || 'http://localhost:3000';

export const getLoanDetails = async (loanId) => {
    const response = await axios.get(`${SERVICE_BASE_URL}/api/loans/${loanId}`);
    return response.data;
};

export const getUserLoans = async (userId, entities) => {
    const response = await axios.get(`${SERVICE_BASE_URL}/api/loans/user/${userId}`, {
        params: {
            ...entities
        }
    });
    return response.data;
};

export const getLoanById = async (loanId) => {
    const response = await axios.get(`${SERVICE_BASE_URL}/api/loans/${loanId}`);
    return response.data;
};

export const getLoanByProductId = async (productId) => {
    const response = await axios.get(`${SERVICE_BASE_URL}/api/loans/product/${productId}`);
    return response.data;       
};


