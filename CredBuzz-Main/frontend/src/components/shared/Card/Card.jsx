import React from 'react';
import styled from 'styled-components';

const StyledCard = styled.div`
  background-color: var(--white);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: ${props => props.padding || '1.5rem'};
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  ${props => props.hoverable && `
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
    }
  `}

  ${props => props.clickable && `
    cursor: pointer;
  `}
`;

const CardHeader = styled.div`
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--black);
  margin: 0;
`;

const CardContent = styled.div`
  color: var(--dark-gray);
`;

const CardFooter = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
`;

const Card = ({ 
  children, 
  title,
  footer,
  padding,
  hoverable = false,
  clickable = false,
  onClick,
  className = '',
  ...props 
}) => {
  return (
    <StyledCard
      padding={padding}
      hoverable={hoverable}
      clickable={clickable}
      onClick={onClick}
      className={className}
      {...props}
    >
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </StyledCard>
  );
};

export default Card; 