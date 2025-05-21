import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { FlexBox, GridBox } from '../../../theme/components';
import LoanCard from './cards/LoanCard';
import { useCustomer } from '../../../context/CustomerContext';
import { useQuery } from '@tanstack/react-query';
import { getUserLoans } from '../../../services/loanService';

const ModuleContainer = styled.div`
  padding: 1rem;
  width: 100%;
   @media (max-width: 600px) {
    padding-bottom: 4rem;
  }
`;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

// Mock API function - replace with actual API call
const fetchLoans = async (userId) => {
  // This would be replaced with actual API call
  return [
    {
      id: "LOAN001",
      userId: userId,
      productId: "LP002",
      loanTypeId: "LP002",
      loanType: "home",
      loanName: "Home Loan",
      amount: 4000000,
      tenure: 240,
      interestRate: 8.5,
      emi: 34628.87,
      status: "active",
      purpose: "Home Purchase",
      disbursementAccount: "100000000005",
      disbursementDate: "2023-06-15T10:00:00Z",
      nextEmiDate: "2024-02-01T00:00:00Z",
      totalPrincipalPaid: 245632.12,
      totalInterestPaid: 169713.32,
      remainingPrincipal: 3754367.88,
      remainingEmis: 233,
      propertyAddress: "Apartment 501, Sunshine Heights, Bangalore"
    },
    {
      id: "LOAN002",
      userId: userId,
      productId: "LP001",
      loanTypeId: "LP001",
      loanType: "personal",
      loanName: "Personal Loan",
      amount: 500000,
      tenure: 36,
      interestRate: 16,
      emi: 17675,
      status: "active",
      purpose: "Home Renovation",
      disbursementAccount: "100000000005",
      disbursementDate: "2023-09-01T10:00:00Z",
      nextEmiDate: "2024-02-01T00:00:00Z",
      totalPrincipalPaid: 88375,
      totalInterestPaid: 70875,
      remainingPrincipal: 411625,
      remainingEmis: 31
    }
  ];
};

const LoansModule = ({
  viewMode = 'grid',
  showProducts = false,
  showProductDetails = false,
  showApplicationForm = false,
  showDetails = false,
  showSchedule = false,
  showPayment = false,
  showStatements = false,
  showClosure = false,
  selectedLoanId = null,
  nlpResponse = null
}) => {
  const [selectedLoan, setSelectedLoan] = useState(selectedLoanId);
  const { customer } = useCustomer();

  const { isLoading, error, data: loans = [] } = useQuery({
    queryKey: ['loans', customer?.profile?.id],
    queryFn: () => getUserLoans(customer?.profile?.id, nlpResponse?.entities || {}),
    cacheTime: 0
  });

  const handleLoanSelect = (loanId) => {
    setSelectedLoan(loanId);
  };

  if (isLoading) {
    return (
      <ModuleContainer>
        <Typography>Loading loans...</Typography>
      </ModuleContainer>
    );
  }

  if (error) {
    return (
      <ModuleContainer>
        <Typography color="error">Error loading loans: {error.message}</Typography>
      </ModuleContainer>
    );
  }

  return (
    <ModuleContainer
      as={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Typography variant="h4" gutterBottom style={{textAlign: 'left', color: 'white'  }}>
        Your Loans
      </Typography>

      <GridBox 
        columns={ "repeat(auto-fit, minmax(300px, 1fr))" }
        gap="2rem"
        
        sx={{
          padding: '1rem 0',
          '@media (max-width: 600px)': {
            padding: '0 0.5rem',
            gap: '1rem',
          },
        }}
      >
        {loans.loans.map((loan) => (
          <motion.div key={loan.id} variants={itemVariants}>
            <LoanCard
              loanId={loan.id}
              loanDetails={loan}
              showDetails={showDetails}
              showSchedule={showSchedule }
              showPayment={showPayment }
              showStatements={showStatements }
              showClosure={showClosure }
              onSelect={() => handleLoanSelect(loan.id)}
              isLoadingLoan={isLoading}
            />
          </motion.div>
        ))}
      </GridBox>
    </ModuleContainer>
  );
};

export default LoansModule; 