import React from 'react';
import styled from 'styled-components';
import { Typography, IconButton, Tooltip } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { GlassCard, FlexBox, CircleIcon } from '../../../../theme/components';

const BalanceCard = styled(GlassCard)`
  padding: 1.5rem;
  width: 100%;
  transition: ${props => props.theme.transitions.quick};
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const BalanceAmount = styled(Typography)`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, 
    ${props => props.theme.palette.primary.main}, 
    ${props => props.theme.palette.primary.light}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 1rem 0;
`;

const BalanceChange = styled(FlexBox)`
  background: ${props => props.isPositive ? 
    props.theme.palette.success.light + '20' : 
    props.theme.palette.error.light + '20'
  };
  color: ${props => props.isPositive ? 
    props.theme.palette.success.main : 
    props.theme.palette.error.main
  };
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.shape.borderRadius}px;
  font-weight: 600;
  font-size: 0.875rem;
`;

const AccountInfo = styled(FlexBox)`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme.palette.grey[200]};
`;

const AccountBalanceCard = ({ 
  accountType = 'Checking',
  accountNumber = '**** 1234',
  balance = 0,
  currency = 'USD',
  changeAmount = 0,
  changePercentage = 0,
  lastUpdated = new Date(),
}) => {
  const isPositive = changeAmount >= 0;
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(balance);

  const formattedChange = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(Math.abs(changeAmount));

  return (
    <BalanceCard>
      <FlexBox justify="space-between">
        <FlexBox gap="1rem">
          <CircleIcon>
            <AccountBalanceWalletIcon />
          </CircleIcon>
          <div>
            <Typography variant="h6">{accountType}</Typography>
            <Typography variant="body2" color="text.secondary">
              {accountNumber }
            </Typography>
          </div>
        </FlexBox>
        <Tooltip title={`Last updated: ${lastUpdated.toLocaleString()}`}>
          <IconButton size="small">
            <TrendingUpIcon />
          </IconButton>
        </Tooltip>
      </FlexBox>

      <BalanceAmount>{formattedBalance}</BalanceAmount>

      {/* <FlexBox gap="1rem">
        <BalanceChange isPositive={isPositive}>
          <FlexBox gap="0.5rem">
            {isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
            {formattedChange} ({changePercentage}%)
          </FlexBox>
        </BalanceChange>
      </FlexBox> */}

      <AccountInfo justify="space-between">
        <Typography variant="body2" color="text.secondary">
          Available Balance
        </Typography>
        <Typography variant="body2" fontWeight="600">
          {formattedBalance}
        </Typography>
      </AccountInfo>
    </BalanceCard>
  );
};

export default AccountBalanceCard; 