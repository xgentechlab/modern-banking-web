import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Typography, 
  TextField, 
  IconButton, 
  Tooltip,
  InputAdornment,
  Chip,
  Menu,
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { GlassCard, FlexBox, CircleIcon } from '../../../../theme/components';

const TransactionsCard = styled(GlassCard)`
  padding: 1.5rem;
  width: 100%;
  transition: ${props => props.theme.transitions.quick};
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const SearchBar = styled(FlexBox)`
  margin: 1.5rem 0;
  gap: 1rem;
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

const TransactionsList = styled.div`
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

const TransactionItem = styled(FlexBox)`
  padding: 1rem;
  background: ${props => props.theme.palette.background.paper};
  border-radius: ${props => props.theme.shape.borderRadius}px;
  transition: ${props => props.theme.transitions.quick};
  
  &:hover {
    background: ${props => props.theme.palette.grey[50]};
  }
`;

const CategoryChip = styled(Chip)`
  background: ${props => props.theme.palette.primary.light + '20'};
  color: ${props => props.theme.palette.primary.main};
  font-size: 0.75rem;
`;

const CardTransactionsCard = ({
  cardNumber = '**** 1234',
  transactions = [],
  onSearch,
  onFilter,
  onDownload,
  currency = 'USD'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
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
    }).format(Math.abs(amount));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (onSearch) {
      onSearch(term);
    }
  };

  return (
    <TransactionsCard>
      <FlexBox justify="space-between" align="center">
        <FlexBox gap="1rem">
          <CircleIcon>
            <ShoppingCartIcon />
          </CircleIcon>
          <div>
            <Typography variant="h6">Card Transactions</Typography>
            <Typography variant="body2" color="text.secondary">
              Card ending in {cardNumber}
            </Typography>
          </div>
        </FlexBox>
        <FlexBox gap="0.5rem">
          <Tooltip title="Filter Transactions">
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
              All Transactions
            </MenuItem>
            <MenuItem onClick={() => handleFilterSelect('online')}>
              Online Purchases
            </MenuItem>
            <MenuItem onClick={() => handleFilterSelect('instore')}>
              In-store Purchases
            </MenuItem>
            <MenuItem onClick={() => handleFilterSelect('recurring')}>
              Recurring Payments
            </MenuItem>
          </Menu>
          <Tooltip title="Download Statement">
            <IconButton onClick={onDownload}>
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        </FlexBox>
      </FlexBox>

      <SearchBar>
        <StyledTextField
          fullWidth
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </SearchBar>

      <TransactionsList>
        {transactions.map((transaction, index) => (
          <TransactionItem key={index} justify="space-between" align="center">
            <FlexBox gap="1rem" flex={1}>
              <CircleIcon size="32px">
                <ShoppingCartIcon fontSize="small" />
              </CircleIcon>
              <div>
                <Typography variant="body1" fontWeight="500">
                  {transaction.merchant}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(transaction.date)}
                </Typography>
                <CategoryChip 
                  label={transaction.category} 
                  size="small" 
                  sx={{ mt: 0.5 }}
                />
              </div>
            </FlexBox>
            
            <FlexBox direction="column" align="flex-end" gap="0.5rem">
              <Typography variant="body1" fontWeight="600">
                {formatAmount(transaction.amount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {transaction.type}
              </Typography>
            </FlexBox>
          </TransactionItem>
        ))}
      </TransactionsList>
    </TransactionsCard>
  );
};

export default CardTransactionsCard; 