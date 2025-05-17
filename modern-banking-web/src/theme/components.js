import styled from 'styled-components';
import { Card, Box } from '@mui/material';
import { themeConfig } from './theme';

export const GlassCard = styled(Card)`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: ${themeConfig.shadows.card};
`;

export const GradientText = styled.span`
  background: linear-gradient(135deg, ${themeConfig.colors.primary.main}, ${themeConfig.colors.primary.light});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const FlexBox = styled(Box)`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  align-items: ${props => props.align || 'center'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => props.gap || '0'};
`;

export const GridBox = styled(Box)`
  display: grid;
  grid-template-columns: ${props => props.columns || 'repeat(auto-fit, minmax(250px, 1fr))'};
  gap: ${props => props.gap || '1rem'};
  padding: ${props => props.padding || '0'};
`;

export const CardHeader = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid ${themeConfig.colors.grey[200]};
`;

export const CardContent = styled(Box)`
  padding: 1rem;
`;

export const CircleIcon = styled(Box)`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border-radius: ${themeConfig.borderRadius.circle};
  background: ${props => props.bg || themeConfig.colors.primary.light};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color || themeConfig.colors.primary.contrastText};
`;

export const ChartContainer = styled(Box)`
  width: 100%;
  height: ${props => props.height || '300px'};
  padding: 1rem;
  background: ${themeConfig.colors.background.paper};
  border-radius: ${themeConfig.borderRadius.large};
  box-shadow: ${themeConfig.shadows.card};
`;

export const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: ${themeConfig.borderRadius.medium};
  font-size: 0.875rem;
  font-weight: 500;
  background: ${props => 
    props.variant === 'success' ? themeConfig.colors.success.light + '20' :
    props.variant === 'error' ? themeConfig.colors.error.light + '20' :
    themeConfig.colors.primary.light + '20'
  };
  color: ${props => 
    props.variant === 'success' ? themeConfig.colors.success.main :
    props.variant === 'error' ? themeConfig.colors.error.main :
    themeConfig.colors.primary.main
  };
`; 