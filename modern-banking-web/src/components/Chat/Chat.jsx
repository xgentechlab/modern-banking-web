import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Box, CircularProgress, Switch, FormControlLabel } from '@mui/material';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import { processMessage, processSmartText, submitMissingParameters } from '../../services/api';
import { useCustomer } from '../../context/CustomerContext';
import { useModule } from '../../context/ModuleContext';


const ChatContainer = styled(Box)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.7);
  
`;

const ToggleContainer = styled(Box)`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  background: ${props => props.theme.palette.background.paper};
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.shape.borderRadius}px;
  box-shadow: ${props => props.theme.shadows[2]};
`;

const LoadingContainer = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Chat = () => {
  const { customer, loading, error } = useCustomer();
  const { handleModuleChange, clearModuleState } = useModule();
  const [messages, setMessages] = useState([]);
  const [smartMode, setSmartMode] = useState(false);
  const [isNewSession, setIsNewSession] = useState(true);

  useEffect(() => {
    if (customer) {
      const { name } = customer.profile;
      const timeOfDay = new Date().getHours();
      let greeting = 'Hello';
      
      if (timeOfDay < 12) greeting = 'Good morning';
      else if (timeOfDay < 18) greeting = 'Good afternoon';
      else greeting = 'Good evening';

      setMessages([
        {
          id: 'welcome',
          text: `${greeting}, ${name}! I'm your banking assistant. How can I help you today?`,
          timestamp: new Date(),
          isUser: false
        }
      ]);
    }
  }, [customer]);

  const addMessage = (message) => {
    const timestamp = new Date();
    const id = `msg_${timestamp.getTime()}`;
    
    setMessages(prev => [...prev, {
      id,
      timestamp,
      ...message
    }]);
    
    return id;
  };

  const scrollToBottom = () => {
    //scroll to bottom of the messages container
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const messagesEndRef = useRef(null);
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const updateMessage = (messageId, updates) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    ));
  };

  const handleSmartModeToggle = () => {
    setSmartMode(prev => !prev);
    setIsNewSession(true); // Reset session when toggling mode
  };

  const handleSendMessage = async (text) => {
    clearModuleState();
    const userMessageId = addMessage({
      text,
      isUser: true
    });

    const responseMessageId = addMessage({
      isLoading: true,
      isUser: false
    });

    try {
      let response;
      if (smartMode) {
        response = await processSmartText({
          user_id: customer?.profile?.id,
          text: text,
          is_new_session: isNewSession
        });
        setIsNewSession(false); // Set to false after first message in smart mode
      } else {
        response = await processMessage(text, customer?.profile?.id);
      }

      updateMessage(responseMessageId, {
        text: response.raw_text,
        moduleCode: response.moduleCode,
        submoduleCode: response.submoduleCode,
        // validation: response.validation,
        entities: response.entities,
        // resolution: response.resolution,
        isLoading: false,
        smartResponse: smartMode ? response.smart_response : null,
        smartMode: smartMode,
        flow: response.flow,
        visualizationType: response.visualizationType,
        analyticsType: response.analyticsType,
        filters: response.filters
      });

    } catch (error) {
      updateMessage(responseMessageId, {
        text: "Sorry, I couldn't process your request.",
        error: error.message,
        isLoading: false
      });
    }
  };

  const handleParameterResolved = async (messageId, updatedResponse) => {
    // Add loading state
    const responseMessageId = addMessage({
      isLoading: true,
      isUser: false
    });

    try {
      // Get the original message
      const originalMessage = messages.find(msg => msg.id === messageId);
      
      // Submit the parameter
      const response = await submitMissingParameters(
        originalMessage.module.moduleCode,
        originalMessage.sub_module.submoduleCode,
        updatedResponse.entities
      );

      // Update with response
      updateMessage(responseMessageId, {
        text: response.raw_text,
        module: response.module,
        sub_module: response.sub_module,
        validation: response.validation,
        entities: response.entities,
        resolution: response.resolution,
        isLoading: false
      });

      // Update module state if response is complete
      // if (response.validation.is_complete) {
      //   handleModuleChange({
      //     module: response.module,
      //     subModule: response.sub_module
      //   }, response.entities);
      // }

    } catch (error) {
      updateMessage(responseMessageId, {
        text: "Sorry, I couldn't complete the action.",
        error: error.message,
        isLoading: false
      });
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ChatContainer>
        <ChatWindow 
          messages={[{
            id: 'error',
            text: "Sorry, we're having trouble loading your information. Please try again later.",
            timestamp: new Date(),
            isUser: false,
            error: true
          }]}
        />
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      <ToggleContainer>
        <FormControlLabel
          control={
            <Switch
              checked={smartMode}
              onChange={handleSmartModeToggle}
              color="primary"
            />
          }
          label="Smart Mode"
        />
      </ToggleContainer>
      <ChatWindow 
        messages={messages}
        onParameterResolved={handleParameterResolved}
        smartMode={smartMode}
      />
      <ChatInput onSendMessage={handleSendMessage} ref={messagesEndRef} />
    </ChatContainer>
  );
};

export default Chat; 