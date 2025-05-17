import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCustomer360Data } from '../services/customerService';

const CustomerContext = createContext();
const customerId = '14785236987460';

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};

export const CustomerProvider = ({ children }) => {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial load - only called once when component mounts
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: In production, this ID should come from authentication
        
        const response = await getCustomer360Data(customerId);
        setCustomerData(response.data);
      } catch (err) {
        setError(err.message);
        console.error('Error loading customer data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []); // Empty dependency array ensures this runs only once

  const value = {
    customer: customerData,
    loading,
    error,
    customerId
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}; 