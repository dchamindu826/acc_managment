import React from 'react';
import styles from './InputField.module.css';

// Simple function to generate a unique enough ID for accessibility if no id is provided
// In real apps, a more robust solution might be needed or making 'id' required.
const generateId = (name) => `input-${name}-${Math.random().toString(36).substr(2, 9)}`;

const InputField = ({
  label,
  type = 'text',
  name,
  id, // Optional: if not provided, one will be generated
  value,
  onChange,
  placeholder,
  error = null, // Pass error message string here, or null/undefined if no error
  required = false,
  className = '', // Class for the wrapper div
  inputClassName = '', // Class for the input element itself
  ...rest // Other input props like 'min', 'max', 'step' etc.
}) => {
  const inputId = id || generateId(name); // Use provided id or generate one
  const wrapperClasses = `${styles.inputGroup} ${className}`;
  const inputClasses = `
    ${styles.input}
    ${error ? styles.inputError : ''}
    ${inputClassName}
  `;

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.requiredAsterisk}> *</span>}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={inputClasses}
        aria-invalid={!!error} // Accessibility: indicate field is invalid if error exists
        aria-describedby={error ? `${inputId}-error` : undefined} // Link error message
        {...rest}
      />
      {error && (
        <span id={`${inputId}-error`} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default InputField;