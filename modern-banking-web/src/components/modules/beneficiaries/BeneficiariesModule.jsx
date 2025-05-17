import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography } from '@mui/material';
import { motion } from 'framer-motion';
import AllBeneficiariesCard from './cards/AllBeneficiariesCard';
import AddBeneficiaryCard from './cards/AddBeneficiaryCard';

const ModuleContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 600px), 1fr));
  gap: 2rem;
  width: 100%;
  padding: 1rem;
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

const BeneficiariesModule = ({
  beneficiaries = [],
  banksList = [],
  accountTypes = [],
  onAddBeneficiary,
  onVerifyBeneficiary,
  onSearch,
  onFilter,
  onTransfer,
  onEdit,
  onDelete,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

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
      <motion.div variants={itemVariants}>
        <AllBeneficiariesCard
          beneficiaries={beneficiaries}
          onSearch={handleSearch}
          onFilter={handleFilter}
          onTransfer={onTransfer}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <AddBeneficiaryCard
          banksList={banksList}
          accountTypes={accountTypes}
          onSubmit={onAddBeneficiary}
          onVerify={onVerifyBeneficiary}
          loading={loading}
        />
      </motion.div>
    </ModuleContainer>
  );
};

export default BeneficiariesModule; 