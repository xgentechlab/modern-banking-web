import axios from 'axios';

const SERVICE_BASE_URL = import.meta.env.VITE_SERVICE_URL || 'http://localhost:3000';

export const getBeneficiary = async (userId, searchValue) => {
  const response = await axios.get(`${SERVICE_BASE_URL}/api/beneficiaries`, { params: { userId, searchValue } });
  return response.data?.beneficiaries || [];
};



