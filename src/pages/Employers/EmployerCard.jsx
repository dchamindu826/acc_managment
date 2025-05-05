// src/pages/Employers/EmployerCard.jsx
import React from 'react';
import Button from '../../components/Button/Button.jsx';
import { FaEdit, FaTrashAlt, FaBirthdayCake, FaMapMarkerAlt, FaPhone, FaEnvelope, FaIdCard, FaUniversity, FaBriefcase, FaUserTag } from 'react-icons/fa'; // Added more icons
import styles from './EmployerCard.module.css';
import { format, parseISO } from 'date-fns';

const EmployerCard = ({ employer, onEdit, onDelete }) => {
  if (!employer) return null;

  // Format birthday safely
  let formattedBirthday = 'N/A';
  if (employer.birthday) {
    try {
      formattedBirthday = format(parseISO(employer.birthday), 'PPP'); // e.g., May 15th, 1990
    } catch {
      formattedBirthday = 'Invalid Date';
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>{employer.name || 'N/A'}</h3>
        <p className={styles.roleDept}>
          <FaUserTag /> {employer.role || 'N/A'} - <FaBriefcase /> {employer.department || 'N/A'}
        </p>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.detailItem}><FaMapMarkerAlt /><span>{employer.address || 'N/A'}</span></div>
        <div className={styles.detailItem}><FaBirthdayCake /><span>{formattedBirthday}</span></div>
        <div className={styles.detailItem}><FaEnvelope /><span>{employer.email || 'N/A'}</span></div>
        <div className={styles.detailItem}><FaPhone /><span>{employer.contactNumber || 'N/A'}</span></div>
        <div className={styles.detailItem}><FaIdCard /><span>NIC/ID: {employer.nic || 'N/A'}</span></div>
        <div className={styles.detailItem}><FaUniversity /><span>Bank: {employer.bankAccount || 'N/A'}</span></div>
        <div className={styles.detailItem}><span>Salary: Rs. {Number(employer.salary || 0).toFixed(2)}</span></div>
        <div className={styles.detailItem}><span>OT Rate: Rs. {Number(employer.otRate || 0).toFixed(2)} /hr</span></div>
      </div>
      <div className={styles.cardFooter}>
        <Button variant="secondary" onClick={() => onEdit(employer)} className={styles.actionButton}>
          <FaEdit /> Edit
        </Button>
        <Button variant="danger" onClick={() => onDelete(employer.id)} className={styles.actionButton}>
          <FaTrashAlt /> Delete
        </Button>
      </div>
    </div>
  );
};

export default EmployerCard;