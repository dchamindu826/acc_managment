// src/pages/Notes/NoteCard.jsx
import React from 'react';
import Button from '../../components/Button/Button.jsx';
import { FaEdit, FaTrashAlt, FaCheckCircle, FaClock } from 'react-icons/fa';
import styles from './NoteCard.module.css';
import { format, parseISO, isPast, isToday } from 'date-fns';

const NoteCard = ({ note, onEdit, onDelete, onMarkDone }) => {
  if (!note) return null;

  let formattedDateTime = 'Invalid Date';
  let isOverdue = false;
  let isDueToday = false;
  try {
    const targetDate = parseISO(note.targetDateTime);
    formattedDateTime = format(targetDate, 'Pp'); // Format: May 2, 2025, 9:00:00 AM
    isOverdue = note.status === 'Pending' && isPast(targetDate);
    isDueToday = note.status === 'Pending' && isToday(targetDate);
  } catch {
      // Keep default 'Invalid Date'
  }

  const cardClasses = `
    ${styles.noteCard}
    ${note.status === 'Done' ? styles.done : ''}
    ${isOverdue ? styles.overdue : ''}
    ${isDueToday ? styles.dueToday : ''}
  `;

  return (
    <div className={cardClasses}>
      <div className={styles.cardContent}>
        <p className={styles.noteText}>{note.content}</p>
      </div>
      <div className={styles.cardFooter}>
        <div className={styles.dateTimeStatus}>
            <span className={styles.dateTime}><FaClock /> {formattedDateTime}</span>
            <span className={`${styles.status} ${styles[note.status?.toLowerCase()]}`}>
                {note.status}
            </span>
            {isOverdue && <span className={styles.overdueBadge}>OVERDUE</span>}
            {isDueToday && !isOverdue && <span className={styles.todayBadge}>DUE TODAY</span>}
        </div>
        <div className={styles.cardActions}>
          {note.status === 'Pending' && (
             <Button variant="success" onClick={() => onMarkDone(note.id)} title="Mark as Done" className={styles.actionButton} size="small">
               <FaCheckCircle /> Done
             </Button>
           )}
          <Button variant="secondary" onClick={() => onEdit(note)} title="Edit Note" className={styles.actionButton} size="small">
            <FaEdit />
          </Button>
          <Button variant="danger" onClick={() => onDelete(note.id)} title="Delete Note" className={styles.actionButton} size="small">
            <FaTrashAlt />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Add size prop handling to Button component if needed, or remove size="small"

export default NoteCard;