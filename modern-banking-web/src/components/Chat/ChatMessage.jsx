import React from 'react';
import styled from 'styled-components';
import { Typography, CircularProgress, Chip } from '@mui/material';
import { GlassCard, Badge, FlexBox } from '../../theme/components';
import EnhancedParameterResolver from '../ParameterResolver/EnhancedParameterResolver';
import ComponentResolver from '../resolvers/ComponentResolver';
import SmartResponse from './SmartResponse';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomer } from '../../context/CustomerContext';

const MessageContainer = styled.div`
  display: flex;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  margin: 0.5rem 0;
  width: 100%;
  align-self: flex-start;
`;

const MessageCard = styled(GlassCard)`
  max-width: ${props => props.isStructured ? '100%' : '80%'};
  padding: 1rem;
  background: ${props => props.isUser ? 
    props.theme.palette.primary.main + '15' : 
    props.theme.palette.background.card};

   display: flex;
   flex-direction: column;
  align-items: ${props => props.isUser ? 'flex-end' : 'flex-start'};

  @media (max-width: 600px) {
    max-width: ${props => props.isStructured ? '100%' : '90%'};
  }
`;

const MessageTime = styled(Typography)`
  font-size: 0.75rem;
  color: ${props => props.theme.palette.text.secondary};
  margin-top: 0.5rem;
`;

const ModuleBadge = styled(Badge)`
  margin-bottom: 0.5rem;
`;

const EntitiesContainer = styled(FlexBox)`
  margin-top: 0.2rem;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
 
  
`;

const ModuleContainer = styled(motion.div)`
  width: 100%;
  margin-top: 1rem;
  // border: 1px solid black;
`;

const ChatMessage = ({ 
  message, 
  onParameterResolved,
  
}) => {
  const { 
    text, 
    isUser, 
    timestamp, 
    moduleCode, 
    submoduleCode, 
    // validation,
    entities,
    isLoading,
    error,
    id,
    smartResponse
  } = message;

  const { customer } = useCustomer();

  const renderEntities = () => {
    if (!entities || Object.keys(entities).length === 0) return null;

    return (
      <EntitiesContainer >
        {Object.entries(entities).map(([key, value]) => (
          <Chip
            key={key}
            label={`${key}: ${value}`}
            size="small"
            variant="outlined"
            color="primary"
          />
        ))}
      </EntitiesContainer>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <CircularProgress size={24} />;
    }

    if (error) {
      return (
        <Typography color="error.main">
          {error}
        </Typography>
      );
    }

    // Always render user messages as is
    if (isUser) {
      return (
        <Typography 
          variant="body1"
          color="primary.main"
          sx={{ whiteSpace: 'pre-wrap' }}
        >
          {text}
        </Typography>
      );
    }

    // For non-user messages
    if (text && !moduleCode) {
      return (
        <Typography 
          variant="body1"
          color="text.primary"
          sx={{ whiteSpace: 'pre-wrap' }}
        >
          {text}
        </Typography>
      );
    }

    // For module responses in non-smart mode
    if (!message.smartMode && moduleCode && submoduleCode) {
      return (
        <FlexBox direction="column" gap="0.1rem" alignItems="flex-start">
          <ModuleBadge>
            {`${moduleCode} › ${submoduleCode}`}
          </ModuleBadge>
          {renderEntities()}
        </FlexBox>
      );
    }

    return null;
  };

  const handleParameterUpdate = (updatedResponse) => {
    if (onParameterResolved) {
      onParameterResolved(id, updatedResponse);
    }
  };

  const renderModuleComponent = () => {
    if (!isUser && !error) {
      if (message.smartMode && smartResponse) {
        return (
          <ModuleContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SmartResponse response={smartResponse} />
          </ModuleContainer>
        );
      }

      if (moduleCode && submoduleCode) {
        return (
          <ModuleContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ComponentResolver
              nlpResponse={message}
              onParameterUpdate={handleParameterUpdate}
              data={entities}
              loading={isLoading}
              customer={customer}
            />
          </ModuleContainer>
        );
      }
    }
    return null;
  };

  const renderParameterResolution = () => {
    if (!isUser && validation?.missing_parameters?.length > 0) {
      return validation.missing_parameters.map((param, index) => (
        <EnhancedParameterResolver
          key={`${param.name}-${index}`}
          parameter={{
            ...param,
            question: validation.questions.find(q => q.parameter === param.name)?.question
          }}
          onParameterResolved={(value) => onParameterResolved(id, param.name, value)}
          validationRules={{
            required: true,
            pattern: param.validation?.pattern && new RegExp(param.validation.pattern),
            errorMessage: param.validation?.errorMessage,
            custom: param.validation?.custom
          }}
          context={entities}
        />
      ));
    }
    return null;
  };
  
  return (
    <div >
      <MessageContainer isUser={isUser}>
        <MessageCard 
          isUser={isUser}
          isStructured={!isUser && moduleCode }
        >
          {renderContent()}
          <MessageTime>
            {new Date(timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </MessageTime>
        </MessageCard>
      </MessageContainer>
      <AnimatePresence>
        {/* {renderParameterResolution()} */}
        {renderModuleComponent()}
      </AnimatePresence>
    </div>
  );
};

export default ChatMessage; 