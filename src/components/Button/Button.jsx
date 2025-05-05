import React from 'react';
import styles from './Button.module.css'; // CSS Module import
import { CgSpinner } from 'react-icons/cg'; // Loading spinner icon

const Button = ({
  children,
  onClick,
  type = 'button', // Default type is 'button'
  variant = 'primary', // 'primary', 'secondary', 'danger'
  disabled = false,
  isLoading = false,
  className = '', // Allow passing extra custom classes
  ...rest // Pass any other props like 'aria-label' etc.
}) => {
  const buttonClasses = `
    ${styles.button}
    ${styles[variant]}
    ${isLoading ? styles.loading : ''}
    ${className}
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonClasses}
      disabled={disabled || isLoading} // Disable if explicitly disabled or loading
      {...rest}
    >
      {isLoading ? (
        <CgSpinner className={styles.spinner} aria-hidden="true" /> // Show spinner when loading
      ) : (
        children // Show button text/content normally
      )}
    </button>
  );
};

export default Button;