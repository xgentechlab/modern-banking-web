import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Typography, 
  TextField, 
  Button, 
  MenuItem,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { GlassCard, FlexBox, CircleIcon } from '../../../../theme/components';

const TransferCard = styled(GlassCard)`
  padding: 1.5rem;
  width: 100%;
  transition: ${props => props.theme.transitions.quick};
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const StyledTextField = styled(TextField)`
  .MuiOutlinedInput-root {
    background: ${props => props.theme.palette.background.paper};
    transition: ${props => props.theme.transitions.quick};

    &:hover {
      background: ${props => props.theme.palette.grey[50]};
    }

    &.Mui-focused {
      background: ${props => props.theme.palette.grey[50]};
    }
  }
`;

const TransferButton = styled(Button)`
  margin-top: 1rem;
  padding: 0.75rem;
`;

const QuickTransferCard = ({
  accounts = [],
  beneficiaries = [],
  onTransfer,
  loading = false,
  currency = 'USD'
}) => {
  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    description: ''
  });

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onTransfer) {
      onTransfer(formData);
    }
  };

  const isFormValid = () => {
    return formData.fromAccount && 
           formData.toAccount && 
           formData.amount > 0 &&
           formData.description;
  };

  return (
    <TransferCard>
      <FlexBox gap="1rem">
        <CircleIcon>
          <SendIcon />
        </CircleIcon>
        <div>
          <Typography variant="h6">Quick Transfer</Typography>
          <Typography variant="body2" color="text.secondary">
            Transfer money to your accounts or beneficiaries
          </Typography>
        </div>
      </FlexBox>

      <Form onSubmit={handleSubmit}>
        <StyledTextField
          select
          label="From Account"
          value={formData.fromAccount}
          onChange={handleChange('fromAccount')}
          fullWidth
        >
          {accounts.map((account) => (
            <MenuItem key={account.id} value={account.id}>
              {account.type} - {account.number} ({account.balance} {currency})
            </MenuItem>
          ))}
        </StyledTextField>

        <StyledTextField
          select
          label="To Account/Beneficiary"
          value={formData.toAccount}
          onChange={handleChange('toAccount')}
          fullWidth
        >
          {beneficiaries.map((beneficiary) => (
            <MenuItem key={beneficiary.id} value={beneficiary.id}>
              {beneficiary.name} - {beneficiary.accountNumber}
            </MenuItem>
          ))}
        </StyledTextField>

        <StyledTextField
          label="Amount"
          type="number"
          value={formData.amount}
          onChange={handleChange('amount')}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">{currency}</InputAdornment>
            ),
          }}
        />

        <StyledTextField
          label="Description"
          value={formData.description}
          onChange={handleChange('description')}
          fullWidth
          multiline
          rows={2}
        />

        <TransferButton
          variant="contained"
          type="submit"
          disabled={!isFormValid() || loading}
          fullWidth
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <>
              <SendIcon sx={{ mr: 1 }} />
              Transfer Money
            </>
          )}
        </TransferButton>
      </Form>
    </TransferCard>
  );
};

export default QuickTransferCard; 