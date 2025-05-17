import axios from 'axios';

const SERVICE_BASE_URL = import.meta.env.VITE_SERVICE_URL || 'http://localhost:3000';

export const getTransasctionsByUserIdAndAccountId = async (userId, accountId) => {
    const response = await axios.get(`${SERVICE_BASE_URL}/api/transfers/${userId}/${accountId}`);
    return response.data;
};

export const getTransfersByUserId = async (userId) => {
    const response = await axios.get(`${SERVICE_BASE_URL}/api/transfers/${userId}`);
    return response.data;
};

// New function to fetch beneficiaries by name
export const getBeneficiariesByName = async (userId, name) => {
    const response = await axios.get(`${SERVICE_BASE_URL}/api/beneficiaries/${userId}`, {
        params: { name }
    });
    return response.data;
};




