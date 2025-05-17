import React from 'react';
import styled from 'styled-components';
import { Typography, IconButton, Tooltip } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { GlassCard, FlexBox, CircleIcon } from '../../../../theme/components';

const StatementCard = styled(GlassCard)`
  padding: 1.5rem;
  width: 100%;
  transition: ${props => props.theme.transitions.quick};
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const TransactionList = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.palette.background.default};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.palette.grey[300]};
    border-radius: ${props => props.theme.shape.borderRadius}px;
  }
`;

const TransactionItem = styled(FlexBox)`
  padding: 1rem;
  background: ${props => props.theme.palette.background.paper};
  border-radius: ${props => props.theme.shape.borderRadius}px;
  transition: ${props => props.theme.transitions.quick};
  
  &:hover {
    background: ${props => props.theme.palette.grey[50]};
  }
`;

const TransactionAmount = styled(Typography)`
  color: ${props => props.isCredit ? 
    props.theme.palette.success.main : 
    props.theme.palette.error.main
  };
  font-weight: 600;
`;

const TransactionIcon = styled(CircleIcon)`
  background: ${props => props.isCredit ? 
    props.theme.palette.success.light + '20' : 
    props.theme.palette.error.light + '20'
  };
  color: ${props => props.isCredit ? 
    props.theme.palette.success.main : 
    props.theme.palette.error.main
  };
`;

const MiniStatementCard = ({ 
  accountNumber = '**** 1234',
  transactions = [],
  currency = 'USD',
}) => {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(Math.abs(amount));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <StatementCard>
      <FlexBox justify="space-between" align="center">
        <FlexBox gap="1rem">
          <CircleIcon>
            <ReceiptLongIcon />
          </CircleIcon>
          <div>
            <Typography variant="h6">Recent Transactions</Typography>
            <Typography variant="body2" color="text.secondary">
              Account: {accountNumber}
            </Typography>
          </div>
        </FlexBox>
        <Tooltip title="Download Statement">
          <IconButton size="small">
            <ReceiptLongIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </FlexBox>

      <TransactionList>
        {transactions.map((transaction, index) => (
          <TransactionItem key={index} justify="space-between">
            <FlexBox gap="1rem">
              <TransactionIcon isCredit={transaction.amount > 0}>
                {transaction.amount > 0 ? 
                  <ArrowUpwardIcon /> : 
                  <ArrowDownwardIcon />
                }
              </TransactionIcon>
              <div>
                <Typography variant="body1" fontWeight="500">
                  {transaction.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(transaction.date)}
                </Typography>
              </div>
            </FlexBox>
            <TransactionAmount 
              variant="body1" 
              isCredit={transaction.amount > 0}
            >
              {transaction.amount > 0 ? '+' : '-'} {formatAmount(transaction.amount)}
            </TransactionAmount>
          </TransactionItem>
        ))}
      </TransactionList>
    </StatementCard>
  );
};

export default MiniStatementCard; 