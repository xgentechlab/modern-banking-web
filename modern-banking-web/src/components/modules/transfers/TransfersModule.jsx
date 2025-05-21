import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { FlexBox, GridBox } from '../../../theme/components';
import QuickTransferCard from './cards/QuickTransferCard';
import TransferHistoryCard from './cards/TransferHistoryCard';
import TransactionCard from './cards/TransactionCard';

const ModuleContainer = styled.div`
  padding: 1rem;
  width: 100%;
   @media (max-width: 600px) {
    padding-bottom: 3rem;
  }
`;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

const TransfersModule = ({
  accounts = [],
  beneficiaries = [],
  transfers = [],
  nlpResponse = null,
  
  onSearch,
  onFilter,
  onDownload,
  loading = false,
  currency = 'USD',
  showQuickTransfer = false
}) => {

  const [response, setResponse] = useState(null);

  useEffect(() => {
    if (nlpResponse) {
      setResponse(nlpResponse);
    }
  }, [nlpResponse]);

  // Mock data for demonstration
  const mockTransfers = [
    {
      id: 1,
      date: new Date(),
      description: 'Rent Payment',
      fromAccount: '**** 1234',
      toAccount: 'John Doe (**** 5678)',
      amount: -1500.00,
      status: 'completed'
    },
    {
      id: 2,
      date: new Date(Date.now() - 86400000),
      description: 'Salary Transfer',
      fromAccount: 'Company Inc.',
      toAccount: '**** 1234',
      amount: 5000.00,
      status: 'completed'
    },
    {
      id: 3,
      date: new Date(Date.now() - 172800000),
      description: 'Investment Transfer',
      fromAccount: '**** 1234',
      toAccount: 'Investment Account (**** 9012)',
      amount: -2000.00,
      status: 'pending'
    }
  ];

  const onResolve = (data) => {
    setResponse(data);

  };  

  const onConfirm = (data) => {
    console.log('onConfirm', data);
  };

  const onTransfer = (data) => {
    console.log('onTransfer', data);
  };

  return (
    <ModuleContainer
      as={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{
        width: '60vw',
        padding: '1rem',
        '@media (max-width: 600px)': {
          width: '90vw',
        },
      }}
    >
      <Typography variant="h4" gutterBottom sx={{
        fontWeight: 'bold',
        fontSize: '2rem',
        color: '#fff',
        textAlign: 'left'
      }}>
        Money Transfers
      </Typography>

      <GridBox 
        columns="repeat(auto-fit, minmax(400px, 1fr))" 
        gap="2rem"
        padding="1rem 0"
        
      >
        {response ? (
          <motion.div variants={itemVariants} >
            <TransactionCard
              nlpResponse={response}
              onResolve={onResolve}
              onConfirm={onConfirm}
              loading={loading}
              currency={currency}
            />
          </motion.div>
        ) : (
          <>
            {showQuickTransfer && (
              <motion.div variants={itemVariants} >
                <QuickTransferCard
                  accounts={accounts}
                  beneficiaries={beneficiaries}
                  onTransfer={onTransfer}
                  loading={loading}
                  currency={currency}
                />
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <TransferHistoryCard
                transfers={transfers.length > 0 ? transfers : mockTransfers}
                onSearch={onSearch}
                onFilter={onFilter}
                onDownload={onDownload}
                currency={currency}
              />
            </motion.div>
          </>
        )}
      </GridBox>
    </ModuleContainer>
  );
};

export default TransfersModule; 