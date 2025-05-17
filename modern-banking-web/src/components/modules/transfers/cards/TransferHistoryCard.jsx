import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Typography, 
  TextField, 
  IconButton, 
  Tooltip,
  InputAdornment,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';
import SendIcon from '@mui/icons-material/Send';
import { GlassCard, FlexBox, CircleIcon } from '../../../../theme/components';

const HistoryCard = styled(GlassCard)`
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

const TransferList = styled.div`
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

const TransferItem = styled(FlexBox)`
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
      case 'completed':
        return props.theme.palette.success.light + '20';
      case 'pending':
        return props.theme.palette.warning.light + '20';
      case 'failed':
        return props.theme.palette.error.light + '20';
      default:
        return props.theme.palette.grey[200];
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed':
        return props.theme.palette.success.main;
      case 'pending':
        return props.theme.palette.warning.main;
      case 'failed':
        return props.theme.palette.error.main;
      default:
        return props.theme.palette.grey[700];
    }
  }};
`;

const TransferHistoryCard = ({
  transfers = [],
  onSearch,
  onFilter,
  onDownload,
  currency = 'USD'
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const formatAmount = (amount) => {
    // return new Intl.NumberFormat('en-US', {
    //   style: 'currency',
    //   currency: currency,
    // }).format(Math.abs(amount));
    return `$${Math.abs(amount).toFixed(2)}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
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
    <HistoryCard>
      <FlexBox justify="space-between" align="center">
        <FlexBox gap="1rem">
          <CircleIcon>
            <SendIcon />
          </CircleIcon>
          <div>
            <Typography variant="h6">Transfer History</Typography>
            <Typography variant="body2" color="text.secondary">
              View and track your transfers
            </Typography>
          </div>
        </FlexBox>
        <FlexBox gap="0.5rem">
          <Tooltip title="Filter Transfers">
            <IconButton onClick={onFilter}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download History">
            <IconButton onClick={onDownload}>
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        </FlexBox>
      </FlexBox>

      <SearchBar>
        <StyledTextField
          fullWidth
          placeholder="Search transfers..."
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

      <TransferList>
        {transfers.map((transfer, index) => (
          <TransferItem key={index} justify="space-between" align="center">
            <FlexBox gap="1rem" flex={1}>
              <CircleIcon size="32px">
                <SendIcon fontSize="small" />
              </CircleIcon>
              <div>
                <Typography variant="body1" fontWeight="500">
                  {transfer.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  From: {transfer.fromAccount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  To: {transfer.toAccount}
                </Typography>
              </div>
            </FlexBox>
            
            <FlexBox direction="column" align="flex-end" gap="0.5rem">
              <Typography variant="body1" fontWeight="600">
                {formatAmount(transfer.amount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(transfer.date)}
              </Typography>
              <StatusChip
                label={transfer.status}
                status={transfer.status}
                size="small"
              />
            </FlexBox>
          </TransferItem>
        ))}
      </TransferList>
    </HistoryCard>
  );
};

export default TransferHistoryCard; 