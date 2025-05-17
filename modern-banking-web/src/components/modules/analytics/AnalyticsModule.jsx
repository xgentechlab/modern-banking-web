import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import styled from 'styled-components';
import AnalyticsCard from './cards/AnalyticsCard';
import { useCustomer } from '../../../context/CustomerContext';

const ModuleContainer = styled(Box)`
  padding: 1rem;
`;

const AnalyticsModule = ({ 
  nlpResponse,
  onParameterUpdate,
  loading = false 
}) => {
  const { customer } = useCustomer();
  
  // Get the title from the NLP response
  const getTitle = () => {
    const { analyticsType, flow } = nlpResponse || {};
    if (flow !== 'ANALYTICS') return 'Analytics';
    
    const titles = {
      'spending_trends': 'Spending Trends',
      'income_analysis': 'Income Analysis',
      'budget_tracking': 'Budget Tracking',
      'transaction_analysis': 'Transaction Analysis',
      'distribution_analysis': 'Expense Distribution',
      'comparison_analysis': 'Spending Comparison',
      'trending_analysis': 'Trend Analysis'
    };
    
    return titles[analyticsType] || 'Analytics';
  };

  return (
    <ModuleContainer>
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {getTitle()}
        </Typography>
        
        {/* Pass the full nlpResponse directly to AnalyticsCard */}
        <AnalyticsCard
          nlpResponse={nlpResponse}
        />
      </Paper>
    </ModuleContainer>
  );
};

export default AnalyticsModule; 