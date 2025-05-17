import React from 'react';
import styled from 'styled-components';
import { 
  Typography, 
  IconButton, 
  Tooltip,
  LinearProgress,
  Switch
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { GlassCard, FlexBox, CircleIcon } from '../../../../theme/components';

const CardDetailsContainer = styled(GlassCard)`
  padding: 1.5rem;
  width: 100%;
  transition: ${props => props.theme.transitions.quick};
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const VirtualCard = styled.div`
  background: linear-gradient(135deg, 
    ${props => props.theme.palette.primary.dark},
    ${props => props.theme.palette.primary.main}
  );
  border-radius: ${props => props.theme.shape.borderRadius}px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  color: white;
  position: relative;
  overflow: hidden;
  min-height: 200px;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
    transform: rotate(45deg);
    pointer-events: none;
  }
`;

const CardNumber = styled(Typography)`
  font-family: 'Courier New', monospace;
  font-size: 1.5rem;
  letter-spacing: 4px;
  margin: 2rem 0;
`;

const CardInfo = styled(FlexBox)`
  margin-top: 1rem;
`;

const CardInfoItem = styled.div`
  text-align: ${props => props.align || 'left'};
`;

const LimitProgress = styled(LinearProgress)`
  height: 8px;
  border-radius: 4px;
  background-color: ${props => props.theme.palette.grey[200]};
  margin: 0.5rem 0;
  
  .MuiLinearProgress-bar {
    background-color: ${props => 
      props.value > 80 
        ? props.theme.palette.error.main 
        : props.theme.palette.success.main};
  }
`;

const CardActions = styled(FlexBox)`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme.palette.grey[200]};
`;

const CreditCardDetailsCard = ({
  cardType = 'Platinum',
  cardNumber = '**** **** **** 1234',
  cardHolder = 'John Doe',
  expiryDate = '12/25',
  cvv = '***',
  spendingLimit = 10000,
  currentSpending = 2500,
  isLocked = false,
  onToggleLock,
  onToggleVisibility,
  showDetails = false,
  currency = 'USD'
}) => {
  const spendingPercentage = (currentSpending / spendingLimit) * 100;
  
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const maskCardNumber = (number) => {
    return showDetails ? number : number.replace(/\d(?=\d{4})/g, "*");
  };

  return (
    <CardDetailsContainer>
      <FlexBox justify="space-between" align="center">
        <FlexBox gap="1rem">
          <CircleIcon>
            <CreditCardIcon />
          </CircleIcon>
          <div>
            <Typography variant="h6">{cardType} Card</Typography>
            <Typography variant="body2" color="text.secondary">
              {isLocked ? 'Card Locked' : 'Card Active'}
            </Typography>
          </div>
        </FlexBox>
        <Tooltip title={showDetails ? 'Hide Card Details' : 'Show Card Details'}>
          <IconButton onClick={onToggleVisibility}>
            {showDetails ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        </Tooltip>
      </FlexBox>

      <VirtualCard>
        <FlexBox justify="space-between">
          <Typography variant="h6">
            {cardType}
          </Typography>
          <img 
            src="/chip.png" 
            alt="Card Chip" 
            style={{ width: 40, height: 40 }}
          />
        </FlexBox>

        <CardNumber>
          {maskCardNumber(cardNumber)}
        </CardNumber>

        <FlexBox justify="space-between">
          <CardInfoItem>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Card Holder
            </Typography>
            <Typography variant="body1">
              {cardHolder}
            </Typography>
          </CardInfoItem>
          <CardInfoItem align="right">
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Expires
            </Typography>
            <Typography variant="body1">
              {expiryDate}
            </Typography>
          </CardInfoItem>
        </FlexBox>
      </VirtualCard>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Spending Limit
      </Typography>
      <LimitProgress 
        variant="determinate" 
        value={spendingPercentage}
      />
      <FlexBox justify="space-between">
        <Typography variant="body2">
          {formatAmount(currentSpending)}
        </Typography>
        <Typography variant="body2">
          {formatAmount(spendingLimit)}
        </Typography>
      </FlexBox>

      <CardActions justify="space-between">
        <FlexBox gap="1rem">
          <LockIcon color={isLocked ? 'error' : 'action'} />
          <Typography>Lock Card</Typography>
        </FlexBox>
        <Switch
          checked={isLocked}
          onChange={onToggleLock}
          color="primary"
        />
      </CardActions>
    </CardDetailsContainer>
  );
};

export default CreditCardDetailsCard; 