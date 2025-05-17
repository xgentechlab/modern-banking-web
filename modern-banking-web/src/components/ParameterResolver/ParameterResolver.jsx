import React from 'react';
import { Box } from '@mui/material';
import { useCustomer } from '../../context/CustomerContext';
import {
  getParameterComponent,
  getParameterData,
  formatParameterValue,
} from '../../utils/parameterComponentMapping';

const ParameterResolver = ({ parameter, onParameterResolved }) => {
  const { customer } = useCustomer();
  
  // Get the component mapping for this parameter
  const componentMapping = getParameterComponent(parameter);
  
  if (!componentMapping) {
    console.warn(`No component mapping found for parameter: ${parameter}`);
    return null;
  }

  // Get the component and the data it needs
  const { component: Component } = componentMapping;
  const data = getParameterData(parameter.name, customer);

  // Handle the selection
  const handleSelect = (value) => {
    const formattedValue = formatParameterValue(parameter.name, value);
    onParameterResolved(formattedValue);
  };

  
  return (
    <Box sx={{ my: 2 }}>
      <Component
        {...data}
        onSelect={handleSelect}
      />
    </Box>
  );
};

export default ParameterResolver; 