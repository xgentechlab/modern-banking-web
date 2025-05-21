import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography } from '@mui/material';
import { motion } from 'framer-motion';
import AllBeneficiariesCard from './cards/AllBeneficiariesCard';
import AddBeneficiaryCard from './cards/AddBeneficiaryCard';
import { useQuery } from '@tanstack/react-query';
import { getBeneficiary } from '../../../services/beneficiaryService';
import { useCustomer } from '../../../context/CustomerContext';

const ModuleContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 600px), 1fr));
  gap: 2rem;
  width: 100%;
  padding: 1rem;
   @media (max-width: 600px) {
    padding-bottom: 4rem;
  }
`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

const banks = [{id: "HDFC", name: "HDFC"}, {id: "ICICI", name: "ICICI"}, {id: "SBI", name: "SBI"}, {id: "AXIS", name: "AXIS"}, {id: "KOTAK", name: "KOTAK"}, {id: "RBL", name: "RBL"}, {id: "IDBI", name: "IDBI"}, {id: "CITI", name: "CITI"}]
const accounts = [{id: "Savings", name: "Savings"}, {id: "Current", name: "Current"}, {id: "Salary", name: "Salary"}, {id: "Demat", name: "Demat"}, {id: "NRI", name: "NRI"}]
const BeneficiariesModule = ({
  
  banksList = banks,
  accountTypes = accounts,
  onAddBeneficiary,
  onVerifyBeneficiary,
  onSearch,
  onFilter,
  onTransfer,
  onEdit,
  onDelete,
  loading = false,
  showList = true,
  showDetails = false,
  showForm = false,
  showBeneficiaryForm
}) => {
  const { customer } = useCustomer();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const { isLoading, error, data: beneficiariesList = [] } = useQuery({
    queryKey: ['beneficiaries', customer?.profile.id],
    queryFn: () => getBeneficiary(customer?.profile.id, ""),
    cacheTime: 0,
    // enabled: viewMode === 'grid'
  });

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (onSearch) {
      onSearch(term);
    }
  };

  const handleFilter = (filter) => {
    setSelectedFilter(filter);
    if (onFilter) {
      onFilter(filter);
    }
  };

  return (
    <ModuleContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {showList && <motion.div variants={itemVariants}>
        <AllBeneficiariesCard
          beneficiaries={beneficiariesList}
          onSearch={handleSearch}
          onFilter={handleFilter}
          onTransfer={onTransfer}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </motion.div>}

      {showBeneficiaryForm && <motion.div variants={itemVariants}>
        <AddBeneficiaryCard
          banksList={banksList}
          accountTypes={accountTypes}
          onSubmit={onAddBeneficiary}
          onVerify={onVerifyBeneficiary}
          loading={loading}
        />
      </motion.div>}
    </ModuleContainer>
  );
};

export default BeneficiariesModule; 