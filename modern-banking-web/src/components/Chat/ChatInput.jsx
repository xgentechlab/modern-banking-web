import React, { useState } from 'react';
import styled from 'styled-components';
import { TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { FlexBox } from '../../theme/components';

const InputContainer = styled(FlexBox)`
  padding: 1rem;
  // background: ${props => props.theme.palette.background.paper};
  border-radius: ${props => props.theme.shape.borderRadius}px;
  box-shadow: ${props => props.theme.shadows[1]};
  width: 70%;
  margin: 0 auto;
  z-index: 1000;
  @media (max-width: 600px) {
  padding: 0.5rem;
    width: 100%;
    border-radius: 0;
  }
`;

const StyledTextField = styled(TextField)`
  .MuiOutlinedInput-root {
    background: ${props => props.theme.palette.background.default};
    border-radius: ${props => props.theme.shape.borderRadius}px;
    transition: ${props => props.theme.transitions.quick};

    &:hover {
      background: ${props => props.theme.palette.background.paper};
    }

    &.Mui-focused {
      background: ${props => props.theme.palette.background.paper};
    }
  }
`;

const SendButton = styled(IconButton)`
  margin-left: 1rem;
  background: ${props => props.theme.palette.primary.main};
  color: ${props => props.theme.palette.primary.contrastText};
  transition: ${props => props.theme.transitions.quick};

  &:hover {
    background: ${props => props.theme.palette.primary.dark};
    transform: scale(1.05);
  }

  &:disabled {
    background: ${props => props.theme.palette.grey[300]};
  }
`;

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{position: 'fixed', bottom: 0, width: '100%'}}>
      <InputContainer>
        <StyledTextField
          fullWidth
          variant="outlined"
          placeholder="Enter your banking command..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          size="medium"
        />
        <SendButton
          type="submit"
          disabled={!message.trim()}
          aria-label="Send message"
          style={{
            backgroundColor: '#d65420',
            color: 'white',
            padding: '0.75rem 0.75rem',
          }}
        >
          <SendIcon />
        </SendButton>
      </InputContainer>
    </form>
  );
};

export default ChatInput; 