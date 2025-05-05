// src/components/Sidebar/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import {
  FaMoneyBillWave, FaUsersCog, FaUserTie, FaFlask, FaExclamationCircle, FaTicketAlt, FaStickyNote // Added FaStickyNote
} from 'react-icons/fa';

// Add Notes to the navItems array
const navItems = [
  { path: '/payments', name: 'Payments', icon: <FaMoneyBillWave /> },
  { path: '/accounts', name: 'Accounts', icon: <FaUsersCog /> },
  { path: '/employers', name: 'Employers', icon: <FaUserTie /> },
  { path: '/chemicals', name: 'Chemicals', icon: <FaFlask /> },
  { path: '/outstanding', name: 'Outstanding', icon: <FaExclamationCircle /> },
  { path: '/gatepass', name: 'Gatepass', icon: <FaTicketAlt /> },
  { path: '/notes', name: 'Notes', icon: <FaStickyNote /> }, // <-- New Link for Notes
];

const Sidebar = () => {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>
        <span>AcctMgmt</span>
      </div>
      <ul className={styles.navList}>
        {navItems.map((item) => (
          <li key={item.path} className={styles.navItem}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
              end // Use 'end' prop for more precise matching, esp. for index routes if added later
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.text}>{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;