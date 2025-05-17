import React from 'react';
import styled from 'styled-components';
import { Typography, Chip } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FlexBox } from '../../theme/components';

const SmartContainer = styled.div`
  width: 100%;
  background: ${props => props.theme.palette.background.paper};
  border-radius: ${props => props.theme.shape.borderRadius}px;
  padding: 1rem;
`;

const MarkdownContainer = styled.div`
  font-family: ${props => props.theme.typography.fontFamily};
  color: ${props => props.theme.palette.text.primary};

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0.5rem 0;

    li::marker {
      display: none;
    }
  }

  li {
    list-style-type: none;
    padding: 0.5rem;
    border-radius: ${props => props.theme.shape.borderRadius}px;
    transition: background-color 0.2s ease;

    &::marker {
      display: none;
    }

    &:hover {
      background: ${props => props.theme.palette.action.hover};
    }
  }

  strong {
    color: ${props => props.theme.palette.primary.main};
    font-weight: 600;
  }

  p {
    margin: 0.5rem 0;
    line-height: 1.6;
  }
`;

const InfoItem = styled(FlexBox)`
  gap: 0.5rem;
  margin: 0.25rem 0;
`;

const Label = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  min-width: 120px;
`;

const Value = styled(Typography)`
  color: ${props => props.theme.palette.text.primary};
  font-weight: 500;
`;

const StatusChip = styled(Chip)`
  background: ${props => props.theme.palette.success.light}15;
  color: ${props => props.theme.palette.success.main};
  font-weight: 500;
`;

const SmartResponse = ({ response }) => {
  if (!response) return null;

  const renderContent = () => {
    return (
      <MarkdownContainer>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            ul: ({children}) => <div>{children}</div>,
            li: ({children, node}) => {
              const text = node.children[0].value || '';
              // if (text.includes('Account')) {
              //   return (
              //     <div style={{ margin: '1rem 0' }}>
              //       <Typography variant="h6" color="primary" gutterBottom>
              //         {text.replace(/\*\*/g, '')}
              //       </Typography>
              //       {children}
              //     </div>
              //   );
              // }

              if (text.includes(':')) {
                const [label, value] = text.split(': ');
                return (
                  <InfoItem>
                    <Label variant="body2">{label}:</Label>
                    {label === 'Status' ? (
                      <StatusChip label={value} size="small" />
                    ) : (
                      <Value variant="body1">{value}</Value>
                    )}
                  </InfoItem>
                );
              }

              return <li>{children}</li>;
            },
            p: ({children}) => (
              <Typography variant="body1" sx={{ margin: '0.5rem 0' }}>
                {children}
              </Typography>
            ),
            strong: ({children}) => (
              <Typography component="strong" color="primary.main" fontWeight="600">
                {children}
              </Typography>
            )
          }}
        >
          {response.content}
        </ReactMarkdown>
      </MarkdownContainer>
    );
  };

  return (
    <SmartContainer>
      {renderContent()}
    </SmartContainer>
  );
};

export default SmartResponse; 