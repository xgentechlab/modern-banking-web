import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { FlexBox, GridBox } from '../../../theme/components';
import ProfileCard from './cards/ProfileCard';
import dummyData from '../../../data/dummy.json';

const ModuleContainer = styled.div`
  padding: 1rem;
  width: 100%;
   @media (max-width: 600px) {
    padding-bottom: 3rem;
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

const ProfileModule = ({
  viewMode = 'form',
  showAddressForm = false,
  showMobileForm = false,
  showEmailForm = false,
  onUpdate,
  nlpResponse
}) => {
  const [profile, setProfile] = useState(dummyData.profiles?.USR001 || {});

  const handleUpdate = (updatedData) => {
    setProfile(prev => ({
      ...prev,
      ...updatedData
    }));
    if (onUpdate) {
      onUpdate(updatedData);
    }
  };

  return (
    <ModuleContainer
      as={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Typography variant="h4" gutterBottom>
        Profile Settings
      </Typography>

      <GridBox 
        columns={viewMode === 'grid' ? "repeat(auto-fit, minmax(400px, 1fr))" : "1fr"}
        gap="2rem"
        padding="1rem 0"
      >
        <motion.div variants={itemVariants}>
          <ProfileCard
            profile={profile}
            showAddressForm={showAddressForm}
            showMobileForm={showMobileForm}
            showEmailForm={showEmailForm}
            viewMode={viewMode}
            onUpdate={handleUpdate}
            nlpResponse={nlpResponse}
          />
        </motion.div>
      </GridBox>
    </ModuleContainer>
  );
};

export default ProfileModule; 