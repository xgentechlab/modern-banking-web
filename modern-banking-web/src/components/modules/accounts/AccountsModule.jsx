import React from 'react';
import styled from 'styled-components';
import { Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { FlexBox, GridBox } from '../../../theme/components';
import EnhancedAccountCard from './cards/EnhancedAccountCard';
import { useCustomer } from '../../../context/CustomerContext';
import { getAccounts, getAccountDetails } from '../../../services/accountService';
import { useQuery } from '@tanstack/react-query';

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

const AccountsModule = ({ 
  viewMode = 'grid',
  showTransactions = false,
  showStatement = false,
  showDetails = false,
  selectedAccountId = null,
  nlpResponse = null,
  showBalances = false,
  title = 'Accounts'
}) => {
  const { customer } = useCustomer();
  // TODO: Get accounts from API
  const { isLoading, error, data: accounts = [] } = useQuery({
    queryKey: ['accounts', customer?.profile.id],
    queryFn: () => getAccounts(customer?.profile.id, nlpResponse?.entities || {}),
    cacheTime: 0,
    // enabled: viewMode === 'grid'
  });
const { entities } = nlpResponse;
  const { isLoading: accountDetailsLoading, error: accountDetailsError, data: accountDetails  } = useQuery({
    queryKey: ['accountDetails', entities.accountNumber],
    queryFn: () => getAccountDetails(customer?.profile.id,nlpResponse?.entities || {} ),
    enabled: false
  });

  if (isLoading) {
    return <Typography>Loading accounts...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error loading accounts: {error.message}</Typography>;
  }

  const getTitle = () => {
    if (viewMode === 'grid') {
      if (showBalances) {
        return 'Your Account balances';
      }
      if (showTransactions) { 
        return 'Your Account transactions';
      }
      if (showStatement) {
        return 'Your Account statement';
      }
      return 'Your Accounts';
    }
    else {
      if (showBalances) {
        return 'Account Balance';
      }
      if (showTransactions) {
        return 'Recent Transactions';
      }
      if (showStatement) {
        return 'Account Statement';
      }
    }
  }



  return (
    <ModuleContainer
      as={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Typography variant="h4" gutterBottom  style={{textAlign: 'left', color: 'white'  }}>
        {getTitle()}
      </Typography>

      <GridBox 
        columns={ "repeat(auto-fit, minmax(300px, 1fr))" }
        gap="2rem"
        padding="1rem 0"
      >
        { accounts.map((account) => (
          <motion.div key={account.id} variants={itemVariants}>
            <EnhancedAccountCard
              accountId={account.id}
              accountType={account.accountType}
              accountNumber={account.accountNumber || account.id}
              balance={account.balance}
              currency={account.currency}
              name={account.accountTypeName}
                showTransactions = {showTransactions && (viewMode === 'single' ? account.id === selectedAccountId : true)}
                showStatement = {showStatement && (viewMode === 'single' ? account.id === selectedAccountId : true)}
             
            />
          </motion.div>
        ))
        }
      </GridBox>
    </ModuleContainer>
  );
};

export default AccountsModule; 