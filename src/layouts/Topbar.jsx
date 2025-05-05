// src/layouts/Topbar.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTime } from '../hooks/useTime';
import styles from './Topbar.module.css';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

const Topbar = () => {
  const { timeString, dateString, greeting } = useTime();

  const greetingVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <header className={styles.topbar}>
      <motion.div
        className={styles.greeting}
        key={greeting} // Re-trigger animation when greeting changes
        variants={greetingVariants}
        initial="hidden"
        animate="visible"
      >
        {greeting}!
      </motion.div>
      <div className={styles.timeInfo}>
        <div className={styles.infoItem}>
          <FaCalendarAlt className={styles.icon} />
          <span>{dateString}</span>
        </div>
        <div className={styles.infoItem}>
          <FaClock className={styles.icon} />
          <span>{timeString}</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;