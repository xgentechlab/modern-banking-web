import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Typography, 
  TextField, 
  Button, 
  MenuItem,
  InputAdornment,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import { GlassCard, FlexBox, CircleIcon } from '../../../../theme/components';

const PaymentCard = styled(GlassCard)`
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

const PaymentButton = styled(Button)`
  margin-top: 1rem;
  padding: 0.75rem;
`;

const QuickBillPaymentCard = ({
  accounts = [],
  billers = [],
  onPayBill,
  loading = false,
  currency = 'USD'
}) => {
  const [formData, setFormData] = useState({
    fromAccount: '',
    biller: null,
    billNumber: '',
    amount: '',
    note: ''
  });

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleBillerChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      biller: newValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onPayBill) {
      onPayBill(formData);
    }
  };

  const isFormValid = () => {
    return formData.fromAccount && 
           formData.biller &&
           formData.billNumber &&
           formData.amount > 0;
  };

  return (
    <PaymentCard>
      <FlexBox gap="1rem">
        <CircleIcon>
          <PaymentsIcon />
        </CircleIcon>
        <div>
          <Typography variant="h6">Quick Bill Payment</Typography>
          <Typography variant="body2" color="text.secondary">
            Pay your bills instantly
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
          required
        >
          {accounts.map((account) => (
            <MenuItem key={account.id} value={account.id}>
              {account.type} - {account.number} ({account.balance} {currency})
            </MenuItem>
          ))}
        </StyledTextField>

        <Autocomplete
          options={billers}
          getOptionLabel={(option) => option.name}
          value={formData.biller}
          onChange={handleBillerChange}
          renderInput={(params) => (
            <StyledTextField
              {...params}
              label="Select Biller"
              required
            />
          )}
        />

        <StyledTextField
          label="Bill Number / Reference"
          value={formData.billNumber}
          onChange={handleChange('billNumber')}
          fullWidth
          required
        />

        <StyledTextField
          label="Amount"
          type="number"
          value={formData.amount}
          onChange={handleChange('amount')}
          fullWidth
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">{currency}</InputAdornment>
            ),
          }}
        />

        <StyledTextField
          label="Payment Note (Optional)"
          value={formData.note}
          onChange={handleChange('note')}
          fullWidth
          multiline
          rows={2}
        />

        <PaymentButton
          variant="contained"
          type="submit"
          disabled={!isFormValid() || loading}
          fullWidth
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <>
              <PaymentsIcon sx={{ mr: 1 }} />
              Pay Bill
            </>
          )}
        </PaymentButton>
      </Form>
    </PaymentCard>
  );
};

export default QuickBillPaymentCard; 