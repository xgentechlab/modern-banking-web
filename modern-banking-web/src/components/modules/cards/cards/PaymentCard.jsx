import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
  Grid,
  Switch
} from '@mui/material';
import {
  CreditCard as CardIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  Lock as LockIcon,
  Redeem as RedeemIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon,
  CardGiftcard as RewardsIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import bankLogo from '../../../../assets/HDFC_Bank_Logo.png';
import dummyData from '../../../../data/dummy.json';
import { GlassCard, FlexBox, CircleIcon } from '../../../../theme/components';

const CardContainer = styled(GlassCard)`
  padding: 1.5rem;
  width: 100%;
  transition: ${props => props.theme.transitions.quick};
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const VirtualCard = styled.div`
  position: relative;
  width: 100%;
  max-width: 450px;
  aspect-ratio: 1.586;
  border-radius: 15px;
  padding: 1.5rem;
  background: ${props => props.cardType === 'credit' ? 
    'linear-gradient(135deg, #2c3e50, #3498db)' : 
    'linear-gradient(135deg, #2c3e50, #27ae60)'};
  color: white;
  margin: 1rem auto;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/card-pattern.png') no-repeat center;
    opacity: 0.1;
    mix-blend-mode: overlay;
  }
`;

const CardNumber = styled(Typography)`
  font-family: 'Roboto Mono', 'Courier New', monospace;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2);

    font-size: 1.7rem;
    letter-spacing: 2px;
  
  margin: 2rem 0;
`;

const CardInfo = styled(FlexBox)`
  justify-content: space-between;
  margin-top: 1rem;
`;

const CardChip = styled.div`
  width: 45px;
  height: 35px;
  background: linear-gradient(135deg, #bdc3c7, #95a5a6);
  border-radius: 5px;
  margin: 1rem 0 1rem 0;
`;

const ProgressSection = styled.div`
  margin: 1rem 0;
`;

const LimitProgressContainer = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: ${props => props.theme.palette.background.paper};
  border-radius: ${props => props.theme.shape.borderRadius}px;
`;

const LimitProgress = styled(LinearProgress)`
  height: 10px;
  border-radius: 5px;
  margin: 0.5rem 0;
  background-color: ${props => props.theme.palette.grey[200]};
  
  .MuiLinearProgress-bar {
    background: ${props => {
      const percentage = (props.value / props.max) * 100;
      if (percentage > 80) return props.theme.palette.error.main;
      if (percentage > 60) return props.theme.palette.warning.main;
      return props.theme.palette.success.main;
    }};
  }
`;

const TabPanel = styled(Box)`
  padding: 1rem 0;
`;

const RewardsBox = styled(Box)`
  background: ${props => props.theme.palette.primary.light}10;
  border-radius: ${props => props.theme.shape.borderRadius}px;
  padding: 1rem;
  margin: 0.5rem 0;
`;

const InfoGrid = styled(Grid)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1rem 0;
`;

const OTPInput = styled(TextField)`
  width: 4rem;
  
  .MuiOutlinedInput-input {
    text-align: center;
    font-size: 1.5rem;
    padding: 0.5rem;
  }
`;

// Mock API functions
const fetchCardDetails = async ({ cardId }) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const card = dummyData.cards && dummyData.cards.find(card => card.id === cardId);
  if (!card) throw new Error('Card not found');
  return card;
};

const fetchRewardCatalog = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return dummyData.rewardCatalog;
};

const PaymentCard = ({ card : cardDetails, isLoadingCard = false, showRewards }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [statementPeriod, setStatementPeriod] = useState('202402');
  const [securityDialog, setSecurityDialog] = useState({ open: false, type: null });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [limitDialog, setLimitDialog] = useState(false);
  const [newLimits, setNewLimits] = useState({ daily: 0, monthly: 0 });
  const [showCardNumber, setShowCardNumber] = useState(false);

  // Queries
  // const { data: cardDetails, isLoading: isLoadingCard } = useQuery({
  //   queryKey: ['card', cardId],
  //   queryFn: () => fetchCardDetails({ cardId }),
  //   staleTime: 30000
  // });

  const { data: rewardCatalog, isLoading: isLoadingRewards } = useQuery({
    queryKey: ['rewardCatalog'],
    queryFn: fetchRewardCatalog,
    staleTime: 30000,
    enabled: activeTab === 2
  });

  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleStatementPeriodChange = (event) => {
    setStatementPeriod(event.target.value);
  };

  const handleSecurityAction = (type) => {
    setSecurityDialog({ open: true, type });
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleLimitChange = (type) => (event) => {
    setNewLimits(prev => ({
      ...prev,
      [type]: Number(event.target.value)
    }));
  };

  const downloadStatement = () => {
    if (!cardDetails?.statements[statementPeriod]) return;
    const statement = cardDetails.statements[statementPeriod];
    const blob = new Blob([JSON.stringify(statement, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `card-statement-${cardId}-${statementPeriod}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCardNumber = (number) => {
    return showCardNumber ? number : number;
  };

  const statementPeriods = {
    '202402': 'February 2024',
    '202401': 'January 2024',
    '202312': 'December 2023',
    '202311': 'November 2023',
    '202310': 'October 2023',
    '202309': 'September 2023',
    
  }

  const renderLimitsProgress = (limit) => {
    return (
      <ProgressSection>
        <FlexBox justify="space-between">
          <Typography variant="body2">{limit.type}</Typography>
          <Typography variant="body2">
            {formatCurrency(limit.consumed)} / {formatCurrency(limit.total)}
          </Typography>
        </FlexBox>
        <LimitProgress
          variant="determinate"
          value={(limit.consumed / limit.total) * 100}
          max={limit.total}
        />
      </ProgressSection>
    );
  };

  if (isLoadingCard) {
    return (
      <CardContainer>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        </CardContent>
      </CardContainer>
    );
  }

  return (
    <CardContainer>
      <FlexBox justify="space-between" align="center">
        <FlexBox gap="1rem">
          <CircleIcon>
            <CardIcon />
          </CircleIcon>
          <div>
            <Typography variant="h6">
              {cardDetails?.type} Card
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {cardDetails?.status}
            </Typography>
          </div>
        </FlexBox>
        <FlexBox gap="0.5rem">
          <Tooltip title={showCardNumber ? "Hide Card Details" : "Show Card Details"}>
            <IconButton onClick={() => setShowCardNumber(!showCardNumber)}>
              {showCardNumber ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title={cardDetails?.status === 'locked' ? "Unlock Card" : "Lock Card"}>
            <IconButton 
              onClick={() => handleSecurityAction('block')}
              color={cardDetails?.status === 'locked' ? "error" : "default"}
            >
              <LockIcon />
            </IconButton>
          </Tooltip>
        </FlexBox>
      </FlexBox>

      <VirtualCard cardType={cardDetails?.cardType}>
        <FlexBox justify="space-between" align="center">
          <Typography style={{fontSize: '0.8rem', letterSpacing: '0.1rem', fontStyle: 'italic'}}>
            {cardDetails?.cardType === 'credit' ? 'REGALIA' : 'PLATINUM'}
          </Typography>
          <img src={bankLogo} alt="Bank Logo" width="100" />
        </FlexBox>

        <CardChip />

        <CardNumber variant='h5'>
          {formatCardNumber(cardDetails?.cardNumber)}
        </CardNumber>

        <CardInfo>
          <div>
            {/* <Typography variant="caption" sx={{ opacity: 0.8 }}>
              CARD HOLDER
            </Typography> */}
            <Typography style={{fontSize: '0.7rem', letterSpacing: '0.17rem'}}>
              {cardDetails?.nameOnCard}
            </Typography>
          </div>
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center' , marginRight: '1rem'}}>
            <Typography  sx={{ opacity: 0.8, lineHeight: '1', marginRight: '0.5rem', fontSize: '0.6rem' }}>
              Valid <br /> Upto
            </Typography>
            <Typography sx={{fontSize: '0.9rem', fontWeight: 600}}>
              {cardDetails?.expiryDate}
            </Typography>
          </div>
        </CardInfo>
      </VirtualCard>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Statements" />
          <Tab label="Security" />
          {cardDetails?.cardType === 'credit' && showRewards && <Tab label="Rewards" />}
          <Tab label="Limits" />
        </Tabs>
      </Box>

      {/* Statements Tab */}
      <TabPanel hidden={activeTab !== 0}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Statement Period</InputLabel>
            <Select
              value={statementPeriod}
              label="Statement Period"
              onChange={handleStatementPeriodChange}
            >
              {Object.entries(statementPeriods).map(([period, statement]) => (
                <MenuItem key={period} value={period}>
                  {statement}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            
            onClick={downloadStatement}
          >
            <DownloadIcon />
            Statement
          </Button>
        </Box>

        {cardDetails?.statements && cardDetails?.statements[statementPeriod] && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cardDetails.statements[statementPeriod].transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>{transaction.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Security Tab */}
      <TabPanel hidden={activeTab !== 1}>
        <Box display="flex" gap={2} flexDirection="column">
          <Button
            variant="outlined"
            startIcon={<LockIcon />}
            onClick={() => handleSecurityAction('block')}
            color="error"
          >
            Block Card
          </Button>
          <Button
            variant="outlined"
            startIcon={<WarningIcon />}
            onClick={() => handleSecurityAction('report')}
            color="warning"
          >
            Report Suspicious Activity
          </Button>
        </Box>
      </TabPanel>

      {/* Rewards Tab */}
      <TabPanel hidden={activeTab !== 9}>
        {isLoadingRewards ? (
          <CircularProgress />
        ) : (
          <>
            <RewardsBox>
              <FlexBox justify="space-between" align="center">
                <div>
                  <Typography variant="h6" color="primary">
                    {cardDetails?.rewardPoints}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available Points
                  </Typography>
                </div>
                <RewardsIcon color="primary" fontSize="large" />
              </FlexBox>
            </RewardsBox>

            <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={2}>
              {rewardCatalog?.map((reward) => (
                <Card key={reward.id} variant="outlined">
                  <CardContent>
                    <Typography variant="h6">{reward.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {reward.description}
                    </Typography>
                    <Typography variant="body1" mt={2}>
                      Points Required: {reward.pointsRequired}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<RedeemIcon />}
                      fullWidth
                      sx={{ mt: 2 }}
                      disabled={cardDetails?.rewardPoints < reward.pointsRequired}
                    >
                      Redeem
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        )}
      </TabPanel>

      {/* Limits Tab */}
      <TabPanel hidden={activeTab !== 2}>
        <Box display="flex" flexDirection="column" gap={3}>
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Current Limits
            </Typography>
            
            <LimitProgressContainer>
              <FlexBox justify="space-between" mb={1}>
                <Typography variant="subtitle2">Daily Limit</Typography>
                <Typography variant="body2">
                  {formatCurrency(cardDetails?.limits.daily.online.consumed || 0)} / {formatCurrency(cardDetails?.limits.daily.online.total || 0)}
                </Typography>
              </FlexBox>
              <LimitProgress
                variant="determinate"
                value={(cardDetails?.limits.daily.online.consumed / cardDetails?.limits.daily.online.total) * 100}
                max={cardDetails?.limits.daily.online.total }
              />
              <Typography variant="caption" color="text.secondary">
                Available: {formatCurrency((cardDetails?.limits.daily.online.total || 0) - (cardDetails?.limits.daily.online .consumed || 0))}
              </Typography>
            </LimitProgressContainer>

            <LimitProgressContainer>
              <FlexBox justify="space-between" mb={1}>
                <Typography variant="subtitle2">Monthly Limit</Typography>
                <Typography variant="body2">
                  {formatCurrency(cardDetails?.limits.monthly.online.consumed || 0)} / {formatCurrency(cardDetails?.limits.monthly.online.total || 0)}
                </Typography>
              </FlexBox>
              <LimitProgress
                variant="determinate"
                value={(cardDetails?.limits.monthly.online.consumed / cardDetails?.limits.monthly.online.total) * 100}
                max={cardDetails?.limits.monthly.online.total }
              />
              <Typography variant="caption" color="text.secondary">
                Available: {formatCurrency((cardDetails?.limits.monthly.online.total || 0) - (cardDetails?.limits.monthly.online.consumed || 0))}
              </Typography>
            </LimitProgressContainer>

            <Button
              variant="contained"
              startIcon={<SettingsIcon />}
              onClick={() => setLimitDialog(true)}
              sx={{ mt: 2 }}
            >
              Modify Limits
            </Button>
          </Box>
        </Box>
      </TabPanel>

      {/* Security Dialog */}
      <Dialog open={securityDialog.open} onClose={() => setSecurityDialog({ open: false, type: null })}>
        <DialogTitle>
          {securityDialog.type === 'block' ? 'Block Card' : 'Report Suspicious Activity'}
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {securityDialog.type === 'block'
              ? 'Are you sure you want to block your card? This action requires OTP verification.'
              : 'Please provide details about the suspicious activity and verify with OTP.'}
          </Typography>
          {securityDialog.type === 'report' && (
            <TextField
              multiline
              rows={4}
              fullWidth
              label="Description"
              margin="normal"
            />
          )}
          <Box display="flex" justifyContent="center" gap={1} mt={2}>
            {otp.map((digit, index) => (
              <OTPInput
                key={index}
                id={`otp-${index}`}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                inputProps={{ maxLength: 1 }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSecurityDialog({ open: false, type: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={securityDialog.type === 'block' ? 'error' : 'warning'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Limits Dialog */}
      <Dialog open={limitDialog} onClose={() => setLimitDialog(false)}>
        <DialogTitle>Modify Card Limits</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Daily Limit"
              type="number"
              value={newLimits.daily || cardDetails?.dailyLimit}
              onChange={handleLimitChange('daily')}
              InputProps={{ startAdornment: '$' }}
            />
            <TextField
              label="Monthly Limit"
              type="number"
              value={newLimits.monthly || cardDetails?.monthlyLimit}
              onChange={handleLimitChange('monthly')}
              InputProps={{ startAdornment: '$' }}
            />
            <Box display="flex" justifyContent="center" gap={1} mt={2}>
              {otp.map((digit, index) => (
                <OTPInput
                  key={index}
                  id={`otp-limit-${index}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  inputProps={{ maxLength: 1 }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLimitDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="primary">
            Update Limits
          </Button>
        </DialogActions>
      </Dialog>
    </CardContainer>
  );
};

export default PaymentCard; 