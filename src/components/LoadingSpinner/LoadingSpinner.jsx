// src/components/LoadingSpinner/LoadingSpinner.jsx
import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ fullScreen = false }) => {
  return (
    <div className={fullScreen ? styles.fullScreenContainer : styles.container}>
      <div className={styles.spinner}></div>
    </div>
  );
};

export default LoadingSpinner;