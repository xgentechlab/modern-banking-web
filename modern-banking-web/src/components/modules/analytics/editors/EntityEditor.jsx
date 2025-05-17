import React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import styled from 'styled-components';

const EditorContainer = styled(Box)`
  padding: 1rem;
`;

const StyledFormControl = styled(FormControl)`
  width: 100%;
  margin-bottom: 1rem;
`;

const TRANSACTION_TYPES = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'recurring', label: 'Recurring' }
];

const TRANSACTION_CHANNELS = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'web', label: 'Web' },
  { value: 'atm', label: 'ATM' }
];

const EntityEditor = ({ entities, onUpdate }) => {
  const handleDateChange = (field) => (date) => {
    onUpdate({
      ...entities,
      [field]: date.toISOString(),
    });
  };

  const handleSelectChange = (field) => (event) => {
    onUpdate({
      ...entities,
      [field]: event.target.value,
    });
  };

  return (
    <EditorContainer>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Stack spacing={2}>
          {/* Date Range Selection */}
          <DatePicker
            label="Start Date"
            value={entities.startDate ? new Date(entities.startDate) : null}
            onChange={handleDateChange('startDate')}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
          
          <DatePicker
            label="End Date"
            value={entities.endDate ? new Date(entities.endDate) : null}
            onChange={handleDateChange('endDate')}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />

          {/* Transaction Type Selection */}
          <StyledFormControl>
            <InputLabel>Transaction Type</InputLabel>
            <Select
              value={entities.transactionType || ''}
              onChange={handleSelectChange('transactionType')}
              label="Transaction Type"
            >
              {TRANSACTION_TYPES.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>

          {/* Transaction Channel Selection */}
          <StyledFormControl>
            <InputLabel>Transaction Channel</InputLabel>
            <Select
              value={entities.transactionChannel || ''}
              onChange={handleSelectChange('transactionChannel')}
              label="Transaction Channel"
            >
              {TRANSACTION_CHANNELS.map(channel => (
                <MenuItem key={channel.value} value={channel.value}>
                  {channel.label}
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>

          {/* Account Selection */}
          {entities.accounts && (
            <StyledFormControl>
              <InputLabel>Account</InputLabel>
              <Select
                value={entities.selectedAccount || ''}
                onChange={handleSelectChange('selectedAccount')}
                label="Account"
              >
                {entities.accounts.map(account => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name}
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>
          )}

          {/* Card Selection */}
          {entities.cards && (
            <StyledFormControl>
              <InputLabel>Card</InputLabel>
              <Select
                value={entities.selectedCard || ''}
                onChange={handleSelectChange('selectedCard')}
                label="Card"
              >
                {entities.cards.map(card => (
                  <MenuItem key={card.id} value={card.id}>
                    {card.name}
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>
          )}
        </Stack>
      </LocalizationProvider>
    </EditorContainer>
  );
};

export default EntityEditor; 