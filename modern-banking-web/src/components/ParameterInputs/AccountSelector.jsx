import React from 'react';
import styled from 'styled-components';
import { Box, Typography } from '@mui/material';
import { GlassCard, FlexBox } from '../../theme/components';

const AccountsContainer = styled(FlexBox)`
  display: flex;
overflow-x: auto;
  padding: 1rem 0;
  gap: 1rem;
  margin: 1rem 0;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const AccountCard = styled(GlassCard)`
  min-width: 280px;
  max-width: 40%;
  cursor: pointer;
  transition: ${props => props.theme.transitions.quick};
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const AccountType = styled(Typography)`
  color: ${props => props.theme.palette.primary.main};
  font-weight: 600;
  text-transform: capitalize;
`;

const AccountBalance = styled(Typography)`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0.5rem 0;
`;

const AccountNumber = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  font-size: 0.875rem;
`;

const AccountSelector = ({ accounts, onSelect }) => {
  if (!accounts || accounts.length === 0) {
    return (
      <Typography color="error">
        No accounts available for selection
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select an Account
      </Typography>
      <AccountsContainer>
        {accounts?.map((account) => (
          <AccountCard
            key={account.id}
            onClick={() => onSelect(account.id)}
          >
            <Box p={2}>
              <AccountType variant="subtitle1">
                {account.type} Account
              </AccountType>
              <AccountBalance variant="h6">
                {account.currency} {account.balance?.toLocaleString()}
              </AccountBalance>
              <AccountNumber>
                {account.id}
              </AccountNumber>
            </Box>
          </AccountCard>
        ))}
      </AccountsContainer>
    </Box>
  );
};

export default AccountSelector; 