// src/pages/Notes/NoteForm.jsx
import React, { useState, useEffect } from 'react';
import InputField from '../../components/InputField/InputField.jsx';
import Button from '../../components/Button/Button.jsx';
import styles from './NoteForm.module.css'; // Create this CSS file next
import { format, parseISO } from 'date-fns';

// Helper to format date and time for input fields
const formatDateTimeForInput = (isoString) => {
    if (!isoString) return { date: '', time: '' };
    try {
        const dt = parseISO(isoString);
        return {
            date: format(dt, 'yyyy-MM-dd'),
            time: format(dt, 'HH:mm'), // 24-hour format for input
        };
    } catch {
        return { date: '', time: '' };
    }
};

const NoteForm = ({ onSubmit, onCancel, initialData = null, isLoading = false }) => {
  const [content, setContent] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [targetTime, setTargetTime] = useState('');
  const [status, setStatus] = useState('Pending'); // Status might be editable in edit mode

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      const { date, time } = formatDateTimeForInput(initialData.targetDateTime);
      setContent(initialData.content || '');
      setTargetDate(date);
      setTargetTime(time);
      setStatus(initialData.status || 'Pending');
    } else {
      // Reset form for adding, default date/time?
      const now = new Date();
      setContent('');
      setTargetDate(format(now, 'yyyy-MM-dd'));
      setTargetTime(format(now, 'HH:mm')); // Default to current time
      setStatus('Pending');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content || !targetDate || !targetTime) {
      alert("Please fill in Note Content, Target Date, and Target Time.");
      return;
    }
    try {
      // Combine date and time and ensure it's a valid ISO string
      const targetDateTimeISO = new Date(`${targetDate}T${targetTime}:00`).toISOString();

      // Create data payload
      const payload = {
        content,
        targetDateTime: targetDateTimeISO,
        // Only include status if editing, otherwise API defaults to Pending
        ...(isEditing && { status: status })
      };
      onSubmit(payload);

    } catch (error) {
        console.error("Error creating date/time string:", error);
        alert("Invalid date or time entered.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.noteForm}>
      <InputField
        label="Note / Reminder Content"
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter your note or reminder..."
        required
        // Use textarea via type or dedicated component later
        as="textarea" // Assuming InputField can handle 'as' prop or similar
        rows={4}
        className={styles.contentArea}
      />

      <div className={styles.dateTimeRow}>
          <InputField
            label="Target Date"
            type="date"
            name="targetDate"
            id="note-date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            required
          />
           <InputField
            label="Target Time"
            type="time"
            name="targetTime"
            id="note-time"
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
            required
          />
      </div>

       {/* Optionally allow editing status only when editing */}
      {isEditing && (
           <div className={styles.formField}>
               <label htmlFor="note-status" className={styles.label}>Status</label>
               <select id="note-status" name="status" value={status} onChange={(e) => setStatus(e.target.value)} required className={styles.selectInput} >
                   <option value="Pending">Pending</option>
                   <option value="Done">Done</option>
               </select>
           </div>
       )}


      <div className={styles.formActions}>
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
          {isEditing ? 'Update Note' : 'Save Note'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default NoteForm;