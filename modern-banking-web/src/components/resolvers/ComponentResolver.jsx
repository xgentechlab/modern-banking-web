import React, { useState } from 'react';
import { Typography, TextField, Button } from '@mui/material';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// Import modules
import AccountsModule from '../modules/accounts/AccountsModule';
import TransfersModule from '../modules/transfers/TransfersModule';
import CardsModule from '../modules/cards/CardsModule';
import BeneficiariesModule from '../modules/beneficiaries/BeneficiariesModule';
import BillsModule from '../modules/bills/BillsModule';
import AccountCard from '../modules/accounts/cards/EnhancedAccountCard';
import ErrorMessage from '../common/ErrorMessage';
import LoansModule from '../modules/loans/LoansModule';
import ProfileModule from '../modules/profile/ProfileModule';
import AnalyticsModule from '../modules/analytics/AnalyticsModule';

// Import resolution helper
import { resolveComponent } from './componentMappings';

const ModuleContainer = styled(motion.div)`
  width: 100%;
 
`;

const ValidationPrompt = styled(motion.div)`
  padding: 1rem;
  margin: 1rem 0;
  background: ${props => props.theme.palette.background.paper};
  border-radius: ${props => props.theme.shape.borderRadius}px;
  box-shadow: ${props => props.theme.shadows[1]};
`;

const moduleComponents = {
  AccountsModule,
  TransfersModule,
  CardsModule,
  BeneficiariesModule,
  BillsModule,
  AccountCard,
  ErrorMessage,
  LoansModule,
  ProfileModule,
  AnalyticsModule
};

const ComponentResolver = ({ 
  nlpResponse, 
  onParameterUpdate,
  data = {},
  loading = false,
  customer,
  smartMode
}) => {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [manualInput, setManualInput] = useState({});

  // Resolve which component to render and its configuration
  const resolution = resolveComponent(nlpResponse, customer);
  const ModuleComponent = moduleComponents[resolution.component];

  if (!ModuleComponent) {
    return (
      <ErrorMessage 
        message={`Unknown component: ${resolution.component}`}
        suggestion="Please try a different request or contact support if the issue persists."
        showRetry={false}
      />
    );
  }

  // Handle entity selection
  const handleEntitySelect = (entity) => {
    setSelectedEntity(entity);
    onParameterUpdate({
      ...nlpResponse,
      validation: {
        ...nlpResponse.validation,
        is_complete: true,
        missing_parameters: []
      },
      entities: {
        ...nlpResponse.entities,
        [entity.type]: entity.value
      }
    });
  };

  console.log('ComponentResolver rendered with nlpResponse:', nlpResponse);
  
  return (
    <ModuleContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* <AnimatePresence>
        {renderValidationPrompts()}
      </AnimatePresence> */}

      <ModuleComponent
        {...data}
        {...resolution.config}
        nlpResponse={nlpResponse}
        loading={loading}
        onEntitySelect={handleEntitySelect}
        selectedEntity={selectedEntity}
      />
    </ModuleContainer>
  );
};

export default ComponentResolver; 