import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { 
  Typography,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import PaymentCard from './cards/PaymentCard';
import { useCustomer } from '../../../context/CustomerContext';
import { getUserCards } from '../../../services/cardService';

const ModuleContainer = styled.div`
  padding: 1.5rem;
  width: 100%;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;





const CardsModule = ({nlpResponse}) => {
  const { customer } = useCustomer();
  const [selectedCard, setSelectedCard] = useState(null);

  const { data: cards, isLoading, error } = useQuery({
    queryKey: ['cards', customer?.profile?.id],
    queryFn: () => getUserCards(customer?.profile?.id, nlpResponse?.entities || {}),
    // enabled: !!customer?.profile?.id
  });

  if (isLoading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load your cards. Please try again later.
      </Alert>
    );
  }

  if (!cards.cards?.length) {
    return (
      <Alert severity="info">
        You don't have any cards yet.
      </Alert>
    );
  }

  return (
    <ModuleContainer>
      <Typography variant="h5" gutterBottom>
        Your Cards
      </Typography>
      
      <Grid container spacing={3}>
        {cards.cards.map((card, index) => (
          <Grid item xs={12} md={6} key={card.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PaymentCard
                card={card}
                onSelect={setSelectedCard}
                isLoadingCard={isLoading}
                showLimits
                showRewards={false}
                showSecurity
                onToggleLock={(cardId) => {
                  // Handle card lock/unlock
                  console.log('Toggle lock for card:', cardId);
                }}
                onToggleVisibility={(cardId) => {
                  // Handle card visibility
                  console.log('Toggle visibility for card:', cardId);
                }}
              />
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </ModuleContainer>
  );
};

export default CardsModule; 