import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Typography, 
  IconButton, 
  Tooltip, 
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  DialogActions
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { GlassCard, FlexBox, CircleIcon } from '../../../../theme/components';
import dummyData from '../../../../data/dummy.json';
import { useCustomer } from '../../../../context/CustomerContext';
import { getTransasctionsByUserIdAndAccountId } from '../../../../services/transferService';
// Styled Components
const AccountCard = styled(GlassCard)`
  padding: 1.5rem;
  width: 100%;
  transition: ${props => props.theme.transitions.quick};
  
  &:hover {
    transform: translateY(-4px);
  }
 
`;

const BalanceAmount = styled(Typography)`
  font-size: 5rem;
  font-weight: 700;
  background: linear-gradient(135deg, 
    ${props => props.theme.palette.primary.main}, 
    ${props => props.theme.palette.primary.light}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 2rem 0;
  @media (max-width: 600px) {
   
  }
`;

const Section = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme.palette.grey[200]};
`;

const TransactionList = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
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
  padding: 0.75rem;
  background: ${props => props.theme.palette.background.paper};
  border-radius: ${props => props.theme.shape.borderRadius}px;
  transition: ${props => props.theme.transitions.quick};
  
  &:hover {
    background: ${props => props.theme.palette.grey[50]};
  }
`;

const StatementControls = styled(FlexBox)`
  margin-top: 1rem;
  gap: 1rem;
`;

// Updated API functions using dummy data
const fetchTransactions = async ( userId, accountId ) => {
   
    const response = await getTransasctionsByUserIdAndAccountId(userId, accountId) || {transfers: []};
    return response;
};

const fetchStatement = async ({ accountId, days }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return dummyData.statements[accountId]?.[days.toString()] || null;
};

const downloadStatement = async (accountId, days) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Create a dummy PDF-like blob
  const statement = dummyData.statements[accountId]?.[days.toString()];
  const content = statement ? JSON.stringify(statement, null, 2) : 'No statement data available';
  const blob = new Blob([content], { type: 'application/json' });
  
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `statement_${accountId}_${days}days.json`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
};

const EnhancedAccountCard = ({ 
  accountId,
  accountNumber,
  name,
  accountType,
  balance,
  currency,
  showTransactions = false,
  showStatement = false
}) => {
  const [showMiniStatement, setShowMiniStatement] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementPeriod, setStatementPeriod] = useState(30);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const { customer } = useCustomer();

  const handleShowTransactions = async () => {
    setShowMiniStatement(!showMiniStatement);
    setTransactionsLoading(true);
    try {
      const response = await fetchTransactions(customer.customerId, accountId);
      setTransactions(response.transfers || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleShowMore = () => {
    setShowAllTransactions(true);
  };

  const handleShowLess = () => {
    setShowAllTransactions(false);
  };

  useEffect(() => {
    if(showTransactions){
      handleShowTransactions();
    }
  }, [showTransactions]);

  const displayedTransactions = showAllTransactions ? transactions : transactions?.slice(0, 5);

  const handleDownloadStatement = async () => {
    try {
      await downloadStatement(accountId, statementPeriod);
    } catch (error) {
      console.error('Error downloading statement:', error);
    }
  };

  const handleStatementModalOpen = () => {
    setShowStatementModal(true);
  };

  const handleStatementModalClose = () => {
    setShowStatementModal(false);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AccountCard>
      <FlexBox justify="space-between" >
        <FlexBox gap="1rem">
          <CircleIcon sx={{
            '@media (max-width: 600px)': {
              backgroundColor: 'orange',
            },
          }}>
            <AccountBalanceWalletIcon />
          </CircleIcon>
          <div sx={{
            '@media (max-width: 600px)': {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            },
          }}>
            
            <Typography variant="body1" >
              {accountNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">{name || accountType}</Typography>
            <BalanceAmount >
        {formatAmount(balance)}
      </BalanceAmount>
          </div>
        </FlexBox>
      </FlexBox>

      {/* Balance */}
      

      {/* Action Buttons */}
      <FlexBox  marginTop="1rem" sx={{
        gap: '0.5rem',
        '@media (max-width: 600px)': {
          flexDirection: 'column',
          position: 'absolute',
          top: 0,
          right: 0,
          marginRight: '0.5rem',
          
          
        },
      }}>
        <Button size='small'
          // variant="outlined"
          
          onClick={handleShowTransactions}
          
        >
         <ReceiptLongIcon />
        </Button>
        <Button
          // variant="outlined"
         
          onClick={handleStatementModalOpen}
          
        >
          <FileDownloadIcon />
        </Button>
      </FlexBox>

      {/* Mini Statement Section */}
      {showMiniStatement && (
        <Section>
          <FlexBox justify="space-between" align="center">
            <FlexBox gap="1rem">
              <CircleIcon size="small">
                <ReceiptLongIcon />
              </CircleIcon>
              <Typography variant="subtitle1">
                Recent Transactions
              </Typography>
            </FlexBox>
          </FlexBox>

          <TransactionList>
            {transactionsLoading ? (
              <FlexBox justify="center" padding="1rem">
                <CircularProgress size={24} />
              </FlexBox>
            ) : (
              <>
                {displayedTransactions?.map((transaction, index) => (
                  <TransactionItem key={index} justify="space-between">
                    <div>
                      <Typography variant="body2" fontWeight="500">
                        {transaction.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(transaction.transactionDate)}
                      </Typography>
                    </div>
                    <Typography 
                      variant="body2" 
                      color={transaction.transactionType !== 'DEBIT' ? 'success.main' : 'error.main'}
                      fontWeight="500"
                    >
                      {transaction.transactionType !== 'DEBIT' ? '+' : ''}{formatAmount(transaction.amount)}
                    </Typography>
                  </TransactionItem>
                ))}
                {transactions?.length > 5 && (
                  <FlexBox justify="center" marginTop="1rem">
                    <Button
                      variant="text"
                      onClick={showAllTransactions ? handleShowLess : handleShowMore}
                      startIcon={showAllTransactions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    >
                      {showAllTransactions ? 'Show Less' : `Show ${transactions.length - 5} More`}
                    </Button>
                  </FlexBox>
                )}
              </>
            )}
          </TransactionList>
        </Section>
      )}

      {/* Statement Download Modal */}
      <Dialog open={showStatementModal} onClose={handleStatementModalClose}>
        <DialogTitle>Download Account Statement</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select the time period for your account statement.
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={statementPeriod}
              onChange={(e) => setStatementPeriod(e.target.value)}
              label="Time Period"
            >
              <MenuItem value={30}>Last 30 Days</MenuItem>
              <MenuItem value={90}>Last 3 Months</MenuItem>
              <MenuItem value={180}>Last 6 Months</MenuItem>
              <MenuItem value={365}>Last 1 Year</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStatementModalClose}>Cancel</Button>
          <Button onClick={handleDownloadStatement} variant="contained">
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </AccountCard>
  );
};

export default EnhancedAccountCard; 