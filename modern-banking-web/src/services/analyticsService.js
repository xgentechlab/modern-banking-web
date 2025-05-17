import axios from 'axios';

const SERVICE_BASE_URL = import.meta.env.VITE_SERVICE_URL || 'http://localhost:3000';


export const fetchAnalyticsDataOld = async (userId, entities) => {
  try {
    const response = await axios.get(`${SERVICE_BASE_URL}/api/analytics/${userId}`, {
      params: entities,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch analytics data');
  }
};

export const fetchAnalyticsData = async (params) => {
  console.log('Fetching analytics data with params:', params);
  
  try {
    const { moduleCode, submoduleCode, analyticsType, visualizationType, filters, userId, entities } = params;
    
    console.log('Making API call to /api/analytics/data with:', {
      moduleCode,
      submoduleCode,
      analyticsType,
      visualizationType,
      filters,
      userId
    });
    
    const response = await fetch(`${SERVICE_BASE_URL}/api/analytics/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        moduleCode,
        submoduleCode,
        analyticsType,
        visualizationType,
        filters,
        userId,
        entities
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch analytics data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Received analytics data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};