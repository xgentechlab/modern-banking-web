import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { FlexBox } from '../../theme/components';
import ChatMessage from './ChatMessage';

const ChatContainer = styled(Box)`
  height: calc(100vh ); // Adjust based on your header/footer
  display: flex;
  flex-direction: column;
  padding: 1rem 1rem 3rem 1rem;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  scroll-behavior: smooth;
  overflow-y: scroll;
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none;
  }
`;

const MessagesContainer = styled(Box)`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  
`;

const ChatWindow = ({ messages = [], onParameterResolved, smartMode }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    //scroll to bottom of the messages container
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  };

  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 500);
  }, [messages]);

  return (
    <ChatContainer>
      <MessagesContainer>
        <FlexBox direction="column" gap="1rem" sx={{paddingX: {xs: 0, md: 5}}}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{alignSelf: message.isUser ? 'flex-end' : 'flex-start', width: '100%'}}
            >
              <ChatMessage 
                message={message}
                onParameterResolved={onParameterResolved}
                smartMode={smartMode}
              />
            </motion.div>
          ))}
         
        </FlexBox>
        <div ref={messagesEndRef} />
      </MessagesContainer>
    
    </ChatContainer>
  );
};

export default ChatWindow; 