import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Typography, 
  IconButton, 
  Tooltip,
  Chip,
  Button,
  Menu,
  MenuItem
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import FilterListIcon from '@mui/icons-material/FilterList';
import PaymentsIcon from '@mui/icons-material/Payments';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { GlassCard, FlexBox, CircleIcon } from '../../../../theme/components';

const BillsCard = styled(GlassCard)`
  padding: 1.5rem;
  width: 100%;
  transition: ${props => props.theme.transitions.quick};
  
  &:hover {
    transform: translateY(-4px);
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

const UpcomingBillsCard = ({
  bills = [],
  onFilter,
  onPayNow,
  onViewDetails,
  currency = 'USD'
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

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
    <BillsCard>
      <FlexBox justify="space-between" align="center">
        <FlexBox gap="1rem">
          <CircleIcon>
            <ReceiptLongIcon />
          </CircleIcon>
          <div>
            <Typography variant="h6">Upcoming Bills</Typography>
            <Typography variant="body2" color="text.secondary">
              Track and pay your bills
            </Typography>
          </div>
        </FlexBox>
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
    </BillsCard>
  );
};

export default UpcomingBillsCard; 