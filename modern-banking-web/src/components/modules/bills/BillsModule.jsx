import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import BillPaymentsCard from './cards/BillPaymentsCard';

const ModuleContainer = styled(motion.div)`
  padding: 1rem;
  width: 100%;
`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const BillsModule = ({
  bills = [],
  accounts = [],
  billers = [],
  onPayBill,
  onPayNow,
  onFilter,
  loading = false,
  currency = 'USD'
}) => {
  // Mock data for demonstration
  const mockBills = [
    {
      id: 1,
      description: 'Electricity Bill',
      billerName: 'Power Corp',
      dueDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
      amount: 150.00,
      status: 'pending'
    },
    {
      id: 2,
      description: 'Water Bill',
      billerName: 'City Water',
      dueDate: new Date(Date.now() - 86400000), // 1 day ago
      amount: 75.00,
      status: 'overdue'
    },
    {
      id: 3,
      description: 'Internet Bill',
      billerName: 'ISP Services',
      dueDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
      amount: 89.99,
      status: 'pending'
    },
    {
      id: 4,
      description: 'Mobile Bill',
      billerName: 'Telecom Inc',
      dueDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
      amount: 45.00,
      status: 'paid'
    }
  ];

  const mockBillers = [
    { id: 1, name: 'Power Corp', category: 'Utilities' },
    { id: 2, name: 'City Water', category: 'Utilities' },
    { id: 3, name: 'ISP Services', category: 'Internet' },
    { id: 4, name: 'Telecom Inc', category: 'Mobile' },
    { id: 5, name: 'Gas Company', category: 'Utilities' },
    { id: 6, name: 'Cable TV', category: 'Entertainment' }
  ];

  return (
    <ModuleContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <BillPaymentsCard
        bills={bills.length > 0 ? bills : mockBills}
        accounts={accounts}
        billers={billers.length > 0 ? billers : mockBillers}
        onPayBill={onPayBill}
        onPayNow={onPayNow}
        onFilter={onFilter}
        loading={loading}
        currency={currency}
      />
    </ModuleContainer>
  );
};

export default BillsModule; 