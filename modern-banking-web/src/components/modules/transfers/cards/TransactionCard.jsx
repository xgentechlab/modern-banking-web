import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Typography, 
  Button, 
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  InputAdornment,
  CircularProgress,
  Box,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { GlassCard, FlexBox, CircleIcon } from '../../../../theme/components';
import { useCustomer } from '../../../../context/CustomerContext';
import { getBeneficiary } from '../../../../services/beneficiaryService';
import { getAccounts } from '../../../../services/accountService';
import { useQuery } from '@tanstack/react-query';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
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

const MatchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
  
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

const MatchItem = styled.div`
  padding: 1rem;
  border-radius: ${props => props.theme.shape.borderRadius}px;
  background: ${props => props.theme.palette.background.paper};
  cursor: pointer;
  transition: ${props => props.theme.transitions.quick};
  @media (max-width: 600px) {
    text-align: left;
  }
  &:hover {
    background: ${props => props.theme.palette.grey[50]};
  }
`;

const TransactionCard = ({
  nlpResponse = {
    moduleCode: 'TRF',
    submoduleCode: 'TRF_IMMEDIATE',
    flow: 'TRANSFER',
    entities: {},
    raw_text: '',
    error: null
  },
  onResolve,
  onConfirm,
  loading = false,
  currency = 'USD'
}) => {
  const { customer } = useCustomer();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [otp, setOtp] = useState('');
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fromAccount: '',
    toBeneficiary: '',
    amount: '',
    notes: ''
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [entities, setEntities] = useState(nlpResponse.entities);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch accounts using React Query
  const { 
    isLoading: isLoadingAccounts, 
    error: accountsError, 
    data: accounts = [] 
  } = useQuery({
    queryKey: ['accounts', customer?.profile?.id],
    queryFn: () => getAccounts(customer?.profile?.id, entities),
    enabled: !!customer?.profile?.id,
    cacheTime: 0
  });

  // Fetch beneficiaries using React Query
  const { 
    isLoading: isLoadingBeneficiaries, 
    error: beneficiariesError, 
    data: beneficiaries = [],
    refetch: refetchBeneficiaries
  } = useQuery({
    queryKey: ['beneficiaries', customer?.profile?.id, searchTerm || entities.recipient || entities.beneficiaryName],
    queryFn: () => {
      console.log('Fetching beneficiaries with:', {
        customerId: customer?.profile?.id,
        searchTerm: searchTerm || entities.recipient || entities.beneficiaryName
      });
      return getBeneficiary(customer?.profile?.id, searchTerm || entities.recipient || entities.beneficiaryName);
    },
    enabled: !!customer?.profile?.id,
    cacheTime: 0
  });

  // Add debug logging to track steps
  useEffect(() => {
    console.log('Current step changed to:', currentStep);
  }, [currentStep]);

  const steps = ['Select Account', 'Select Beneficiary', 'Confirm Transfer'];

  // Determine the initial step based on entities
  useEffect(() => {
    console.log('Setting initial step based on entities:', entities);
    
    // If we have both source account and beneficiary, go to confirmation
    if ((entities.sourceAccountType || entities.sourceAccountNumber) ) {
      console.log('Source account found');
      const sourceAccount = accounts.find(account => account.accountNumber === entities.sourceAccountNumber || account.accountType === entities.sourceAccountType);
      
      
      setFormData(prev => ({
        ...prev,
        fromAccount: sourceAccount ? sourceAccount.id : null,
        
      }));
      setCurrentStep(1);
    } 
    
    // If we have beneficiary but no source account
     if (entities.beneficiaryName || entities.beneficiaryId) {
      console.log('Beneficiary found, going to account selection');
      if (entities.beneficiaryId) {
        setFormData(prev => ({
          ...prev,
          toBeneficiary: entities.beneficiaryId
        }));
      }
      
    }
    
    
  }, [accounts, beneficiaries]);

  // Set amount from entities if available
  useEffect(() => {
    if (entities.amount) {
      setFormData(prev => ({
        ...prev,
        amount: entities.amount
      }));
    }
  }, [entities.amount]);

  // Handler for account selection
  const handleSourceAccountChange = (e) => {
    const accountId = e.target.value;
    console.log(`Selected account: ${accountId}`);
    setFormData({
      ...formData,
      fromAccount: accountId
    });
  };

  // Handler for beneficiary selection
  const handleBeneficiaryChange = (e) => {
    const beneficiaryId = e.target.value;
    console.log(`Selected beneficiary: ${beneficiaryId}`);
    setFormData({
      ...formData,
      toBeneficiary: beneficiaryId
    });
  };

  // Move to next step after account selection
  const handleAccountSelectionNext = () => {
    console.log('Account selected:', formData.fromAccount);
    
    setCurrentStep(1);
    
    if (onResolve) {
      const updatedEntities = {
        ...entities,
        sourceAccountId: formData.fromAccount
      };
      
      console.log('Updating entities with:', updatedEntities);
      
      onResolve({
        ...nlpResponse,
        entities: updatedEntities
      });
    }
    
    // Force refresh beneficiaries if needed
    if (refetchBeneficiaries) {
      console.log('Refetching beneficiaries');
      refetchBeneficiaries();
    }
  };

  // Submit the transaction
  const handleTransactionSubmit = () => {
    if (onConfirm) {
      onConfirm({
        ...nlpResponse,
        entities: {
          ...entities,
          sourceAccountId: entities.sourceAccountId || formData.fromAccount,
          beneficiaryId: entities.beneficiaryId || formData.toBeneficiary,
          amount: entities.amount || parseFloat(formData.amount),
          currency: entities.currency || currency
        },
        otp: otp
      });
    }
    setShowOtpDialog(false);
    setOtp('');
  };

  // Handle amount change
  const handleAmountChange = (e) => {
    setFormData({
      ...formData,
      amount: e.target.value
    });
  };

  // Handle transfer submission
  const handleTransferSubmit = () => {
    const transferAmount = parseFloat(entities.amount || formData.amount) || 0;
    console.log('Transfer amount:', transferAmount);
    
    setShowOtpDialog(true);
   
      console.log('Submitting transfer with data:', {
        sourceAccountId: entities.sourceAccountId || formData.fromAccount,
        beneficiaryId: entities.beneficiaryId || formData.toBeneficiary,
        amount: transferAmount,
        currency: entities.currency || 'USD',
        notes: formData.notes
      });
      
      // Here you would call your API to submit the transfer
      // For now we'll just set currentStep to 3 (success)
      // setCurrentStep(3);
    
  };

  // Helper function to map current step to stepper display value
  const getStepperValue = () => {
    if (currentStep === 1.5) return 1; // Show amount entry step as part of beneficiary selection in stepper
    if (currentStep > 2) return 2; // Cap at confirmation step for success
    return currentStep;
  };

  // Render account selection step (Step 0)
  const renderAccountSelectionStep = () => {
    return (
      <div>
        <Typography variant="subtitle1" gutterBottom>
          Select Source Account
        </Typography>
        
        {isLoadingAccounts ? (
          <FlexBox justify="center" padding="2rem">
            <CircularProgress />
          </FlexBox>
        ) : accountsError ? (
          <Typography color="error" align="center" sx={{ my: 2 }}>
            Failed to load accounts: {accountsError.message}
          </Typography>
        ) : accounts.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            p: 3, 
            border: '1px dashed', 
            borderColor: 'divider',
            borderRadius: 1,
            my: 2
          }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No accounts available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              You need at least one active account to make a transfer.
            </Typography>
            <Typography variant="body2">
              Please contact customer support to open a new account or activate an existing one.
            </Typography>
          </Box>
        ) : (
          <>
            <RadioGroup 
              value={formData.fromAccount}
              onChange={handleSourceAccountChange}
            >
              <MatchList>
                {accounts.map((account) => (
                  <MatchItem 
                    key={account.id} 
                    onClick={() => handleSourceAccountChange({ target: { value: account.id }})}
                  >
                    <FormControlLabel
                      value={account.id}
                      control={<Radio />}
                      label={
                        <div style={{textAlign: 'left'}}>
                          <Typography variant="body1">
                            {account.accountTypeName} - {account.accountNumber}
                          </Typography>
                          <Typography variant="body2" color="primary">
                            Balance: {formatCurrency(account.balance, account.currency)}
                          </Typography>
                        </div>
                      }
                    />
                  </MatchItem>
                ))}
              </MatchList>
            </RadioGroup>
            
            <Button
              variant="contained"
              onClick={handleAccountSelectionNext}
              disabled={!formData.fromAccount || loading}
              fullWidth
              sx={{ mt: 2 }}
            >
              Next
            </Button>
          </>
        )}
      </div>
    );
  };

  // Render beneficiary selection step (Step 1)
  const renderBeneficiarySelectionStep = () => {
    return (
      <Box className="transfers-step-container">
        <Typography variant="h6" className="step-title">Select Beneficiary</Typography>
        
        <TextField
          fullWidth
          label="Search Beneficiaries"
          variant="outlined"
          margin="normal"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            refetchBeneficiaries();
          }}
        />
        
        {isLoadingBeneficiaries ? (
          <FlexBox justify="center" padding="2rem">
            <CircularProgress />
          </FlexBox>
        ) : beneficiariesError ? (
          <Typography color="error" align="center" sx={{ my: 2 }}>
            Failed to load beneficiaries: {beneficiariesError.message}
          </Typography>
        ) : beneficiaries.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            p: 3, 
            border: '1px dashed', 
            borderColor: 'divider',
            borderRadius: 1,
            my: 2
          }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No beneficiaries available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {entities.beneficiaryName ? 
                `We couldn't find any beneficiaries matching "${entities.beneficiaryName}".` : 
                "You haven't added any beneficiaries to your account yet."}
            </Typography>
            <Typography variant="body2">
              Please add a beneficiary through the Beneficiaries section before making a transfer.
            </Typography>
          </Box>
        ) : (
          <>
            <RadioGroup 
              value={formData.toBeneficiary}
              onChange={handleBeneficiaryChange}
            >
              <MatchList>
                {beneficiaries.map((beneficiary) => (
                  <MatchItem 
                    key={beneficiary.id} 
                    onClick={() => handleBeneficiaryChange({ target: { value: beneficiary.id }})}
                  >
                    <FormControlLabel
                      value={beneficiary.id}
                      control={<Radio />}
                      label={
                        <div style={{textAlign: 'left'}}>
                          <Typography variant="body1">
                            {beneficiary.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {beneficiary.bankName} - {beneficiary.accountNumber}
                          </Typography>
                        </div>
                      }
                    />
                  </MatchItem>
                ))}
              </MatchList>
            </RadioGroup>
            
            
            <Box mt={2} display="flex" justifyContent="space-between">
          <Button 
            variant="outlined" 
            onClick={() => {
              // If amount was from entities (not manually entered), go back to beneficiary step
              // Otherwise go back to amount entry step
              setCurrentStep(0);
            }}
          >
            Back
          </Button>
          <Button
              variant="contained"
              color="primary"
              disabled={!formData.toBeneficiary}
              onClick={() => {
                console.log('Next button clicked in beneficiary selection');
                // If amount is already in entities, go to confirmation
                if (entities.amount) {
                  setCurrentStep(2);
                } else {
                  // Otherwise go to amount entry step
                  setCurrentStep(1.5);
                }
                
              }}
            >
              Next
            </Button>
        </Box>
          </>
        )}
      </Box>
    );
  };

  // Render amount entry step (Step 1.5)
  const renderAmountEntryStep = () => {
    return (
      <Box className="transfers-step-container">
        <Typography variant="h6" className="step-title">Enter Transfer Amount</Typography>
        
        <Box mt={3} mb={3}>
          <TextField
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">{entities.currency || currency}</InputAdornment>
              ),
            }}
          />
        </Box>
        
        <Box mt={2} display="flex" justifyContent="space-between">
          <Button
            variant="outlined"
            onClick={() => setCurrentStep(0)}
          >
            Back
          </Button>
          <Box mt={2} display="flex" justifyContent="space-between">
          <Button 
            variant="outlined" 
            onClick={() => {
              // If amount was from entities (not manually entered), go back to beneficiary step
              // Otherwise go back to amount entry step
              setCurrentStep(entities.amount ? 1 : 1.5);
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              console.log('Proceeding to confirmation with amount:', formData.amount);
              setCurrentStep(2);
              
            }}
            disabled={!formData.amount}
          >
            Next
          </Button>
        </Box>
         
        </Box>
      </Box>
    );
  };

  // Format currency for display
  const formatCurrency = (amount, currency) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || entities.currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Render confirmation step (Step 2)
  const renderConfirmationStep = () => {
    if (isLoadingAccounts || isLoadingBeneficiaries) {
      return (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    console.log('Confirmation data:', {
      accounts, 
      beneficiaries,
      entities,
      formData
    });

    // Find selected account and beneficiary from the data
    const selectedAccount = accounts.find(account => account.id === formData.fromAccount)
    const selectedBeneficiary = beneficiaries.find(beneficiary => beneficiary.id === formData.toBeneficiary)
    
    return (
      <Box className="transfers-step-container" >
        <Typography variant="h6" className="step-title" style={{textAlign: 'left', paddingBottom: '1rem'}}>Confirm Transfer Details</Typography>
        
        <Box className="confirmation-details">
          <Box className="confirmation-item">
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: '0.5rem'}}>
            <Typography variant="subtitle2">From Account:</Typography>
            <Typography variant="body1">
              {selectedAccount ? 
                `${selectedAccount.accountTypeName} - ${selectedAccount.accountNumber}` : 
                entities.sourceAccountId || formData.fromAccount || 'Not specified'}
            </Typography>
            </div>
          </Box>
          
          <Box className="confirmation-item">
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: '0.5rem'}}>

            <Typography variant="subtitle2">To Beneficiary:</Typography>
            <Typography variant="body1">
              {selectedBeneficiary ? 
                `${selectedBeneficiary.name} - ${selectedBeneficiary.accountNumber}` : 
                entities.beneficiaryId || formData.toBeneficiary || entities.recipient || 'Not specified'}
            </Typography> 
            </div>
          </Box>
          
          <Box className="confirmation-item">
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: '0.5rem'}}>

            <Typography variant="subtitle2">Amount:</Typography>
            <Typography variant="body1" fontWeight="bold">
              {formatCurrency(parseFloat(entities.amount || formData.amount) || 0, entities.currency || 'USD')}
            </Typography>
            </div>
          </Box>
          
          {formData.notes && (
            <Box className="confirmation-item">
              <Typography variant="subtitle2">Notes:</Typography>
              <Typography variant="body1">{formData.notes}</Typography>
            </Box>
          )}
        </Box>
        
        <Box mt={2} display="flex" justifyContent="space-between">
          <Button 
            variant="outlined" 
            onClick={() => {
              // If amount was from entities (not manually entered), go back to beneficiary step
              // Otherwise go back to amount entry step
              setCurrentStep(entities.amount ? 1 : 1.5);
            }}
          >
            Back
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleTransferSubmit}
            disabled={!selectedAccount || !selectedBeneficiary || !(entities.amount || formData.amount)}
          >
            Confirm Transfer
          </Button>
        </Box>
      </Box>
    );
  };

  // Render success step
  const renderSuccessStep = () => {
    return (
      <Box className="transfers-step-container" textAlign="center">
        <Box mb={3}>
          <CheckCircleIcon color="success" style={{ fontSize: 64 }} />
        </Box>
        <Typography variant="h5" gutterBottom>Transfer Successful!</Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Your transfer has been processed successfully. A confirmation email has been sent to your registered email address.
        </Typography>
        <Typography variant="body2" paragraph>
          Transaction Reference: {Math.random().toString(36).substring(2, 10).toUpperCase()}
        </Typography>
        <Box mt={3}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              // Reset the form and go back to step 0
              setFormData({
                fromAccount: '',
                toBeneficiary: '',
                amount: '',
                notes: ''
              });
              //refetch accounts and beneficiaries
             setEntities(prev => ({
              ...prev,
              sourceAccountId: '',
              beneficiaryId: '',
              amount: '',
              currency: ''
             }));
              refetchBeneficiaries();
              
              setSearchTerm('');
              setError(null);
              setCurrentStep(0);
            }}
          >
            Make Another Transfer
          </Button>
        </Box>
      </Box>
    );
  };

  // Determine chip color based on transaction type
  const getChipColor = (type) => {
    switch (type.toLowerCase()) {
      case 'credit':
        return 'success';
      case 'debit':
        return 'error';
      default:
        return 'default';
    }
  };

  let selectedAccount = accounts.find(account => account.id === formData.fromAccount);
  let selectedBeneficiary = beneficiaries.find(beneficiary => beneficiary.id === formData.toBeneficiary);

  // Main component render
  return (
    <Card className="transaction-card" sx={{width: '50%', height: 'fit-content', '@media (max-width: 600px)': {width: '90vw'}}}>
      <CardContent>
        <Box className="stepper-container" mb={3}>
          <Stepper activeStep={getStepperValue()} alternativeLabel>
            <Step>
              <StepLabel>Select Account</StepLabel>
            </Step>
            <Step>
              <StepLabel>Select Beneficiary</StepLabel>
            </Step>
            <Step>
              <StepLabel>Confirm Details</StepLabel>
            </Step>
          </Stepper>
        </Box>

        {currentStep === 0 && renderAccountSelectionStep()}
        {currentStep === 1 && renderBeneficiarySelectionStep()}
        {currentStep === 1.5 && renderAmountEntryStep()}
        {currentStep === 2 && renderConfirmationStep()}
        {currentStep === 3 && renderSuccessStep()}

        {/* <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          <Chip
            icon={<LocalAtmIcon />}
            label={formatCurrency(parseFloat(entities.amount || formData.amount) || 0)}
            color={getChipColor(entities.amount ? 'credit' : 'debit')}
            variant="filled"
          />
          
          <Chip
            icon={<AccountBalanceIcon />}
            label={selectedAccount ? `${selectedAccount.accountTypeName} - ${selectedAccount.accountNumber}` : entities.sourceAccountId || formData.fromAccount || 'Not specified'}
            color="primary"
            variant="outlined"
          />
          
          <Chip
            icon={<CalendarTodayIcon />}
            label={formatDate(entities.date || new Date())}
            color="default"
            variant="outlined"
          />
        </Box> */}
      </CardContent>
      
      {/* OTP Dialog */}
      <Dialog open={showOtpDialog} onClose={() => setShowOtpDialog(false)}>
        <DialogTitle>Enter OTP</DialogTitle>
        <DialogContent>
          <Box p={2} width="100%" textAlign="center">
            <Typography variant="body1" gutterBottom>
              Please enter the 6-digit OTP sent to your registered mobile number
            </Typography>
            <TextField
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              error={!!error}
              helperText={error}
              fullWidth
              margin="normal"
              inputProps={{
                maxLength: 6,
                pattern: '[0-9]*'
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOtpDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              if (otp.length !== 6) {
                setError('Please enter a valid 6-digit OTP');
                return;
              }
              
              setError(null);
              setShowOtpDialog(false);
              console.log('OTP verified successfully:', otp);
              
              // Process the transfer after OTP verification
              setCurrentStep(3);
            }} 
            variant="contained"
            color="primary"
          >
            Verify & Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TransactionCard; 
