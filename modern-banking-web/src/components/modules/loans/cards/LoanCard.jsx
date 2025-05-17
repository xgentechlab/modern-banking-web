import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { FlexBox } from '../../../../theme/components';

const LoanContainer = styled(Card)`
  width: 100%;
  margin: 16px;
  
`;

const TabPanel = styled(Box)`
  padding: 16px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
`;

const StyledTableRow = styled(TableRow)`
  &:nth-of-type(odd) {
    background-color: ${props => props.theme.palette.action.hover};
  }
`;

const ProgressContainer = styled.div`
  margin: 20px 0;
`;

const ProgressLabel = styled(Typography)`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

// Mock API functions
const fetchLoanDetails = async ({ loanId }) => {
  // This would be replaced with actual API call
  return {
    id: loanId,
    loanType: "personal",
    loanName: "Personal Loan",
    amount: 500000,
    tenure: 36,
    interestRate: 16,
    emi: 17675,
    status: "active",
    purpose: "Home Renovation",
    disbursementDate: "2023-09-01T10:00:00Z",
    nextEmiDate: "2024-02-01T00:00:00Z",
    totalPrincipalPaid: 88375,
    totalInterestPaid: 70875,
    remainingPrincipal: 411625,
    remainingEmis: 31
  };
};

const fetchEMISchedule = async ({ loanId }) => {
  // This would be replaced with actual API call
  return [
    {
      installmentNo: 1,
      dueDate: "2023-10-01T10:00:00.000Z",
      emi: 17675,
      principal: 11008.33,
      interest: 6666.67,
      remainingPrincipal: 488991.67
    }
  ];
};

const LoanCard = ({ 
  loanId,
  showDetails = false,
  showSchedule = false,
  showPayment = false,
  showStatements = false,
  onSelect,
  loanDetails,
   isLoadingLoan
}) => {
  const [activeTab, setActiveTab] = useState(0);

  // const { data: loanDetails, isLoading: isLoadingLoan } = useQuery({
  //   queryKey: ['loan', loanId],
  //   queryFn: () => fetchLoanDetails({ loanId }),
  //   staleTime: 30000
  // });

  const { data: emiSchedule, isLoading: isLoadingEMI } = useQuery({
    queryKey: ['emiSchedule', loanId],
    queryFn: () => fetchEMISchedule({ loanId }),
    staleTime: 30000,
    enabled: activeTab === 1
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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

  const calculateProgress = () => {
    if (!loanDetails) return 0;
    const totalAmount = loanDetails.amount;
    const paidAmount = loanDetails.totalPrincipalPaid;
    return (paidAmount / totalAmount) * 100;
  };

  if (isLoadingLoan) {
    return (
      <LoanContainer>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        </CardContent>
      </LoanContainer>
    );
  }

  return (
    <LoanContainer>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {loanDetails?.loanName} ({loanDetails?.id})
        </Typography>
        
        <InfoGrid>
          <Typography variant="body1">
            Loan Amount: {formatCurrency(loanDetails?.amount)}
          </Typography>
          <Typography variant="body1">
            EMI Amount: {formatCurrency(loanDetails?.emi)}
          </Typography>
          <Typography variant="body1">
            Interest Rate: {loanDetails?.interestRate}%
          </Typography>
          <Typography variant="body1">
            Tenure: {loanDetails?.tenure} months
          </Typography>
        </InfoGrid>

        <ProgressContainer>
          <ProgressLabel>
            <span>Repayment Progress</span>
            <span>{calculateProgress().toFixed(1)}%</span>
          </ProgressLabel>
          <LinearProgress 
            variant="determinate" 
            value={calculateProgress()} 
            sx={{ height: 10, borderRadius: 5 }}
          />
          <FlexBox justify="space-between" marginTop={1}>
            <Typography variant="body2" color="text.secondary">
              Paid: {formatCurrency(loanDetails?.totalPrincipalPaid)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Remaining: {formatCurrency(loanDetails?.remainingPrincipal)}
            </Typography>
          </FlexBox>
        </ProgressContainer>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Loan Details" />
            <Tab label="EMI Schedule" />
          </Tabs>
        </Box>

        {/* Loan Details Tab */}
        <TabPanel hidden={activeTab !== 0}>
          <InfoGrid>
            <Typography variant="body1">
              Next EMI Date: {formatDate(loanDetails?.nextEmiDate)}
            </Typography>
            <Typography variant="body1">
              Remaining EMIs: {loanDetails?.remainingEmis}
            </Typography>
            <Typography variant="body1">
              Total Interest Paid: {formatCurrency(loanDetails?.totalInterestPaid)}
            </Typography>
            <Typography variant="body1">
              Disbursement Date: {formatDate(loanDetails?.disbursementDate)}
            </Typography>
            <Typography variant="body1">
              Loan Purpose: {loanDetails?.purpose}
            </Typography>
            <Typography variant="body1">
              Status: {loanDetails?.status.toUpperCase()}
            </Typography>
          </InfoGrid>
        </TabPanel>

        {/* EMI Schedule Tab */}
        <TabPanel hidden={activeTab !== 1}>
          {isLoadingEMI ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>No.</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell align="right">EMI</TableCell>
                    <TableCell align="right">Principal</TableCell>
                    <TableCell align="right">Interest</TableCell>
                    <TableCell align="right">Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {emiSchedule?.map((emi) => (
                    <StyledTableRow key={emi.installmentNo}>
                      <TableCell>{emi.installmentNo}</TableCell>
                      <TableCell>{formatDate(emi.dueDate)}</TableCell>
                      <TableCell align="right">{formatCurrency(emi.emi)}</TableCell>
                      <TableCell align="right">{formatCurrency(emi.principal)}</TableCell>
                      <TableCell align="right">{formatCurrency(emi.interest)}</TableCell>
                      <TableCell align="right">{formatCurrency(emi.remainingPrincipal)}</TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </CardContent>
    </LoanContainer>
  );
};

export default LoanCard; 