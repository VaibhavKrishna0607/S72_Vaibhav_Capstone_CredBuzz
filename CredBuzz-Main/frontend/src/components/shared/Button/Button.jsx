import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => {
    switch (props.size) {
      case 'small': return '0.375rem 0.75rem';
      case 'large': return '0.75rem 1.5rem';
      default: return '0.5rem 1rem';
    }
  }};
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '0.875rem';
      case 'large': return '1.125rem';
      default: return '1rem';
    }
  }};
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  outline: none;

  ${props => {
    switch (props.variant) {
      case 'secondary':
        return `
          background-color: transparent;
          color: var(--black);
          border: 2px solid var(--black);
          &:hover {
            background-color: var(--black);
            color: var(--white);
            transform: translateY(-2px);
          }
        `;
      case 'outline':
        return `
          background-color: transparent;
          color: var(--black);
          border: 2px solid var(--black);
          &:hover {
            background-color: var(--black);
            color: var(--white);
          }
        `;
      default:
        return `
          background-color: var(--black);
          color: var(--white);
          &:hover {
            background-color: var(--dark-gray);
            transform: translateY(-2px);
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Button = ({ 
  children, 
  variant = 'primary',
  size = 'medium',
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <StyledButton
      type={type}
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button; 