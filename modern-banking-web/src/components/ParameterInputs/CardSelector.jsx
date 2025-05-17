import React from 'react';
import styled from 'styled-components';
import { Box, Typography } from '@mui/material';
import { GlassCard, FlexBox } from '../../theme/components';

const CardsContainer = styled(FlexBox)`
  overflow-x: auto;
  padding: 1rem 0;
  gap: 1rem;
  margin: 1rem 0;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CardItem = styled(GlassCard)`
  min-width: 320px;
  background: linear-gradient(135deg, 
    ${props => props.variant === 'platinum' ? '#2C3E50, #BDC3C7' :
    props.variant === 'business' ? '#614385, #516395' :
    '#000428, #004e92'});
  color: white;
  cursor: pointer;
  transition: ${props => props.theme.transitions.quick};
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const CardType = styled(Typography)`
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.75rem;
  opacity: 0.9;
`;

const CardNumber = styled(Typography)`
  font-size: 1.25rem;
  font-family: monospace;
  letter-spacing: 2px;
  margin: 1rem 0;
`;

const CardDetails = styled(FlexBox)`
  justify-content: space-between;
  margin-top: 1rem;
`;

const CardSelector = ({ cards, onSelect }) => {
  if (!cards || cards.length === 0) {
    return (
      <Typography color="error">
        No cards available for selection
      </Typography>
    );
  }

  const maskCardNumber = (number) => {
    return `****  ****  ****  ${number.slice(-4)}`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select a Card
      </Typography>
      <CardsContainer>
        {cards.map((card) => (
          <CardItem
            key={card.id}
            variant={card.variant}
            onClick={() => onSelect(card.id)}
          >
            <Box p={2}>
              <CardType>
                {card.type} Card • {card.variant}
              </CardType>
              <CardNumber>
                {maskCardNumber(card.cardNumber)}
              </CardNumber>
              <CardDetails>
                <Box>
                  <Typography variant="caption">Expires</Typography>
                  <Typography>{card.expiryDate}</Typography>
                </Box>
                {card.type === 'credit' && (
                  <Box>
                    <Typography variant="caption">Available Limit</Typography>
                    <Typography>
                      {card.currency} {card.availableLimit.toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </CardDetails>
            </Box>
          </CardItem>
        ))}
      </CardsContainer>
    </Box>
  );
};

export default CardSelector; 