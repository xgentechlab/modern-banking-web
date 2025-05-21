import React from 'react';
import styled from 'styled-components';
import { Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { GlassCard, FlexBox } from '../../theme/components';
import { motion } from 'framer-motion';

const ErrorCard = styled(GlassCard)`
  padding: 2rem;
  background: ${props => props.theme.palette.error.light}10;
  border: 1px solid ${props => props.theme.palette.error.light};
  width: 100%;
  max-width: 600px;
  margin: 1rem auto;
  margin-bottom: 5rem;
`;

const IconContainer = styled(FlexBox)`
  color: ${props => props.theme.palette.error.main};
  margin-bottom: 1rem;
`;

const ErrorMessage = ({ 
  message, 
  suggestion,
  onRetry,
  showRetry = true 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <ErrorCard>
        <FlexBox direction="column" align="center" gap="1rem">
          <IconContainer>
            <ErrorOutlineIcon fontSize="large" />
          </IconContainer>
          
          <Typography variant="h6" color="error" align="center">
            {message}
          </Typography>
          
          {suggestion && (
            <Typography variant="body2" color="text.secondary" align="center">
              {suggestion}
            </Typography>
          )}
          
          {showRetry && onRetry && (
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={onRetry}
              sx={{ mt: 1 }}
            >
              Try Again
            </Button>
          )}
        </FlexBox>
      </ErrorCard>
    </motion.div>
  );
};

export default ErrorMessage; 