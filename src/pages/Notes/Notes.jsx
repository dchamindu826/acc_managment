// src/pages/Notes/Notes.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { FaPlus, FaFilter } from 'react-icons/fa';
import useMockApi from '../../hooks/useMockApi';
import { getNotes, addNote, updateNote, deleteNote } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner.jsx';
import Button from '../../components/Button/Button.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import NoteCard from './NoteCard.jsx'; // Import the card component
import NoteForm from './NoteForm.jsx'; // Import the form component
import styles from './Notes.module.css'; // Create this CSS file next
import { startOfDay, isToday, parseISO, isValid } from 'date-fns';

const Notes = () => {
  const { data: notes, isLoading, error, refresh: refreshNotes } = useMockApi(getNotes, [], []);

  // State for Modal (Add/Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for Filtering/Sorting (Example: Filter by Status)
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Pending', 'Done'

  // --- Filtering & Sorting Logic ---
  const filteredAndSortedNotes = useMemo(() => {
    if (!notes) return [];
    return notes
      .filter(note => {
        if (filterStatus === 'All') return true;
        return note.status === filterStatus;
      })
      // Sort by targetDateTime, soonest first (Pending first, then Done)
      .sort((a, b) => {
          if (a.status === 'Pending' && b.status === 'Done') return -1;
          if (a.status === 'Done' && b.status === 'Pending') return 1;
          // If same status, sort by date
          try {
             return parseISO(a.targetDateTime) - parseISO(b.targetDateTime);
          } catch {
              return 0; // Keep order if dates invalid
          }
      });
  }, [notes, filterStatus]);

  // --- Handlers ---
  const handleOpenAddModal = useCallback(() => {
    setEditingNote(null);
    setShowModal(true);
  }, []);

  const handleOpenEditModal = useCallback((note) => {
    setEditingNote(note);
    setShowModal(true);
  }, []);

  const handleFormSubmit = useCallback(async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingNote) {
        await updateNote(editingNote.id, formData); // Update existing
      } else {
        await addNote(formData); // Add new
      }
      refreshNotes();
      setShowModal(false);
      setEditingNote(null);
    } catch (err) {
      console.error("Failed to save note:", err);
      alert(`Error: ${err.message || 'Failed to save note'}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [editingNote, refreshNotes]);

  const handleDeleteNote = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
        refreshNotes();
      } catch (err) {
        console.error("Failed to delete note:", err);
        alert(`Error: ${err.message || 'Failed to delete note'}`);
      }
    }
  }, [refreshNotes]);

  // Handler to quickly mark a note as Done
  const handleMarkAsDone = useCallback(async (id) => {
      // Find the note to prevent unnecessary updates if already done (optional)
      // const note = notes?.find(n => n.id === id);
      // if (note && note.status === 'Done') return;

      setIsSubmitting(true); // Use general submitting flag or a specific one
      try {
          await updateNote(id, { status: 'Done' });
          refreshNotes();
      } catch(err) {
          console.error("Failed to mark note as done:", err);
          alert(`Error: ${err.message || 'Failed to mark as done'}`);
      } finally {
           setIsSubmitting(false);
      }
  }, [refreshNotes]); // Removed 'notes' dependency if not checking status beforehand


  // --- Effect for Reminder Notification (Mock) ---
  useEffect(() => {
    if (notes && notes.length > 0) {
      const today = startOfDay(new Date()); // Use browser's current date
      const dueNotes = notes
        .filter(note => {
            if (note.status !== 'Pending') return false; // Only check pending notes
            try {
                const targetDate = parseISO(note.targetDateTime);
                // Check if the note's date is today OR in the past
                return isValid(targetDate) && targetDate <= today;
            } catch {
                return false;
            }
        })
        .map(note => `- ${note.content}`) // Format the notes
        .join('\n'); // Join multiple notes with newlines

      if (dueNotes) {
        // Simple alert. Replace with a toast notification library (e.g., react-toastify) for better UX.
        // This alert will show every time the component loads/refreshes if conditions met.
        setTimeout(() => { // Use timeout to avoid blocking initial render
             alert(`Pending Reminders Due Today or Overdue:\n${dueNotes}`);
        }, 500);
      }
    }
    // Run only when notes data changes
  }, [notes]);


  return (
    <div className={styles.notesPage}>
      <header className={styles.header}>
        <h1>Notes & Reminders</h1>
        <Button variant="primary" onClick={handleOpenAddModal}>
          <FaPlus /> Add Note
        </Button>
      </header>

      {/* --- Filter Section --- */}
      <section className={styles.filterSection}>
          <FaFilter className={styles.filterIcon}/>
          <div className={styles.filterGroup}>
            <label htmlFor="status-filter">Filter by Status:</label>
            <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={styles.selectInput}
            >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Done">Done</option>
            </select>
          </div>
          {/* Add other filters like date range if needed */}
      </section>

      {isLoading && <LoadingSpinner />}
      {error && <p className={styles.error}>Error loading notes: {error}</p>}

      {!isLoading && !error && (
        <div className={styles.notesGrid}>
          {filteredAndSortedNotes && filteredAndSortedNotes.length > 0 ? (
            filteredAndSortedNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteNote}
                onMarkDone={handleMarkAsDone}
              />
            ))
          ) : (
            <p>No notes found{filterStatus !== 'All' ? ` with status: ${filterStatus}` : ''}.</p>
          )}
        </div>
      )}

      {/* --- Add/Edit Note Modal --- */}
      <Modal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setEditingNote(null); }}
          title={editingNote ? 'Edit Note / Reminder' : 'Add New Note / Reminder'}
      >
          <NoteForm
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowModal(false); setEditingNote(null); }}
              initialData={editingNote}
              isLoading={isSubmitting}
          />
      </Modal>

    </div>
  );
};

export default Notes;