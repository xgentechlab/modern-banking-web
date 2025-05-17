import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Typography, 
  TextField, 
  Button, 
  MenuItem,
  InputAdornment,
  CircularProgress,
  Autocomplete,
  Tabs,
  Tab,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Menu
} from '@mui/material';
import {
  Payments as PaymentsIcon,
  Receipt as ReceiptIcon,
  FilterList as FilterListIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { GlassCard, FlexBox, CircleIcon } from '../../../../theme/components';

const PaymentCard = styled(GlassCard)`
  width: 100%;
  margin: 16px;
  min-width: 600px;
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

const BillsList = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 500px;
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

const BillItem = styled(FlexBox)`
  padding: 1rem;
  background: ${props => props.theme.palette.background.paper};
  border-radius: ${props => props.theme.shape.borderRadius}px;
  transition: ${props => props.theme.transitions.quick};
  
  &:hover {
    background: ${props => props.theme.palette.grey[50]};
  }
`;

const TabPanel = styled(Box)`
  padding: 16px 0;
`;

const StatusChip = styled(Chip)`
  background: ${props => {
    switch (props.status) {
      case 'paid':
        return props.theme.palette.success.light + '20';
      case 'pending':
        return props.theme.palette.warning.light + '20';
      case 'overdue':
        return props.theme.palette.error.light + '20';
      default:
        return props.theme.palette.grey[200];
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'paid':
        return props.theme.palette.success.main;
      case 'pending':
        return props.theme.palette.warning.main;
      case 'overdue':
        return props.theme.palette.error.main;
      default:
        return props.theme.palette.grey[700];
    }
  }};
`;

const BillerName = styled(Typography)`
  color: ${props => props.theme.palette.primary.main};
  font-size: 0.875rem;
  font-weight: 500;
`;

const DueDate = styled(Typography)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.isOverdue ? props.theme.palette.error.main : props.theme.palette.text.secondary};
  font-size: 0.875rem;
`;

const BillPaymentsCard = ({
  accounts = [],
  billers = [],
  bills = [],
  onPayBill,
  onPayNow,
  onFilter,
  loading = false,
  currency = 'USD'
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    fromAccount: '',
    biller: null,
    billNumber: '',
    amount: '',
    note: ''
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    if (onFilter) {
      onFilter(filter);
    }
    handleFilterClose();
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

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDueDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (date) => {
    return new Date(date) < new Date();
  };

  return (
    <PaymentCard>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            icon={<PaymentsIcon sx={{ mr: 1 }} />}
            label="Quick Pay"
            iconPosition="start"
          />
          <Tab 
            icon={<ReceiptIcon sx={{ mr: 1 }} />}
            label="Upcoming Bills"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Quick Pay Tab */}
      <TabPanel hidden={activeTab !== 0}>
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

          <Button
            variant="contained"
            type="submit"
            disabled={!isFormValid() || loading}
            fullWidth
            sx={{ mt: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <>
                <PaymentsIcon sx={{ mr: 1 }} />
                Pay Bill
              </>
            )}
          </Button>
        </Form>
      </TabPanel>

      {/* Upcoming Bills Tab */}
      <TabPanel hidden={activeTab !== 1}>
        <FlexBox justify="space-between" align="center" mb={2}>
          <Typography variant="h6">
            Your Bills
          </Typography>
          <Tooltip title="Filter Bills">
            <IconButton onClick={handleFilterClick}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleFilterClose}
          >
            <MenuItem onClick={() => handleFilterSelect('all')}>
              All Bills
            </MenuItem>
            <MenuItem onClick={() => handleFilterSelect('pending')}>
              Pending Bills
            </MenuItem>
            <MenuItem onClick={() => handleFilterSelect('overdue')}>
              Overdue Bills
            </MenuItem>
            <MenuItem onClick={() => handleFilterSelect('paid')}>
              Paid Bills
            </MenuItem>
          </Menu>
        </FlexBox>

        <BillsList>
          {bills.map((bill) => (
            <BillItem key={bill.id} justify="space-between" align="center">
              <FlexBox gap="1rem" flex={1}>
                <CircleIcon size="32px">
                  <PaymentsIcon fontSize="small" />
                </CircleIcon>
                <div>
                  <Typography variant="body1" fontWeight="500">
                    {bill.description}
                  </Typography>
                  <BillerName>
                    {bill.billerName}
                  </BillerName>
                  <DueDate isOverdue={isOverdue(bill.dueDate)}>
                    <CalendarTodayIcon fontSize="small" />
                    Due {formatDueDate(bill.dueDate)}
                  </DueDate>
                </div>
              </FlexBox>
              
              <FlexBox direction="column" align="flex-end" gap="0.5rem">
                <Typography variant="body1" fontWeight="600">
                  {formatAmount(bill.amount)}
                </Typography>
                <StatusChip
                  label={bill.status}
                  status={bill.status}
                  size="small"
                />
                {bill.status !== 'paid' && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => onPayNow(bill)}
                    startIcon={<PaymentsIcon />}
                  >
                    Pay Now
                  </Button>
                )}
              </FlexBox>
            </BillItem>
          ))}
        </BillsList>
      </TabPanel>
    </PaymentCard>
  );
};

export default BillPaymentsCard; 