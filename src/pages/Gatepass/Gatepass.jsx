// src/pages/Gatepass/Gatepass.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { FaFilter, FaEdit, FaTrashAlt, FaPlus, FaFileExcel } from 'react-icons/fa';
import useMockApi from '../../hooks/useMockApi';
import { getGatepasses, addGatepass, updateGatepass, deleteGatepass } from '../../services/api';
import { exportGatepassToExcel } from '../../utils/exportUtils.jsx';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner.jsx';
import Table from '../../components/Table/Table.jsx';
import Button from '../../components/Button/Button.jsx';
import InputField from '../../components/InputField/InputField.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import GatepassForm from './GatepassForm.jsx'; // Import the new form
import styles from './Gatepass.module.css'; // Create this CSS file next
import { format, parseISO, startOfDay, isToday, isValid } from 'date-fns'; // Added isToday

const Gatepass = () => {
  const { data: gatepasses, isLoading, error, refresh: refreshGatepasses } = useMockApi(getGatepasses, [], []);

  // State for Filters
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // State for Add/Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingGatepass, setEditingGatepass] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Filtering Logic ---
  const filteredGatepasses = useMemo(() => {
    if (!gatepasses) return [];
    return gatepasses.filter(item => {
      // Check based on receiveDate OR sendDate being within range
      let dateMatch = true;
      let receiveD = null;
      let sendD = null;

      try { receiveD = item.receiveDate && isValid(parseISO(item.receiveDate)) ? startOfDay(parseISO(item.receiveDate)) : null; } catch {}
      try { sendD = item.sendDate && isValid(parseISO(item.sendDate)) ? startOfDay(parseISO(item.sendDate)) : null; } catch {}

      if (filterStartDate && isValid(new Date(filterStartDate))) {
        const start = startOfDay(new Date(filterStartDate));
        // Must have at least one date >= start date
        dateMatch = (receiveD && receiveD >= start) || (sendD && sendD >= start);
      }
      if (dateMatch && filterEndDate && isValid(new Date(filterEndDate))) {
        const end = startOfDay(new Date(filterEndDate));
        // Must have at least one date <= end date
        dateMatch = (receiveD && receiveD <= end) || (sendD && sendD <= end);
      }
      // If no dates provided, it's a match OR if dates provided, it passed the check
      return dateMatch;
    });
  }, [gatepasses, filterStartDate, filterEndDate]);

  // --- Handlers ---
  const handleOpenAddModal = useCallback(() => {
    setEditingGatepass(null);
    setShowModal(true);
  }, []);

  const handleOpenEditModal = useCallback((gatepass) => {
    setEditingGatepass(gatepass);
    setShowModal(true);
  }, []);

  const handleFormSubmit = useCallback(async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingGatepass) {
        await updateGatepass(editingGatepass.id, formData); // Update existing
      } else {
        await addGatepass(formData); // Add new
      }
      refreshGatepasses();
      setShowModal(false);
      setEditingGatepass(null);
    } catch (err) {
      console.error("Failed to save gatepass:", err);
      alert(`Error: ${err.message || 'Failed to save gatepass'}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [editingGatepass, refreshGatepasses]);

  const handleDeleteGatepass = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this gatepass record?')) {
      try {
        await deleteGatepass(id);
        refreshGatepasses();
      } catch (err) {
        console.error("Failed to delete gatepass:", err);
        alert(`Error: ${err.message || 'Failed to delete gatepass'}`);
      }
    }
  }, [refreshGatepasses]);

  const handleExport = useCallback(() => {
      const dataToExport = filteredGatepasses; // Export filtered data
      if (!dataToExport || dataToExport.length === 0) {
          alert(`No gatepass data available to export for the selected date range.`);
          return;
      }
      const dateRange = { start: filterStartDate, end: filterEndDate };
      const fileName = `gatepass_export_${format(new Date(), 'yyyyMMdd')}.xlsx`;
      exportGatepassToExcel(dataToExport, dateRange, fileName);
  }, [filteredGatepasses, filterStartDate, filterEndDate]);

  // --- Define Columns for the Gatepass Table ---
  const gatepassColumns = useMemo(() => [
    { key: 'receiveDate', label: 'Receive Date', render: (v) => { try { return v ? format(parseISO(v), 'PP') : 'N/A'; } catch { return 'Invalid Date'; } } },
    { key: 'sendDate', label: 'Send Date', render: (v) => { try { return v ? format(parseISO(v), 'PP') : 'N/A'; } catch { return 'Invalid Date'; } } },
    { key: 'category', label: 'Category' },
    { key: 'invoiceNumber', label: 'Invoice No' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'remarks', label: 'Remarks' },
    { key: 'specialNote', label: 'Special Note' },
    // { key: 'noteDate', label: 'Note Date', render: (v) => { try { return v ? format(parseISO(v), 'PP') : 'N/A'; } catch { return 'Invalid Date'; } } }, // Optional: Show note date
    {
      key: 'actions', label: 'Actions',
      render: (_, item) => (
        <div className={styles.actionButtons}>
          <Button variant="secondary" onClick={() => handleOpenEditModal(item)} title="Edit Record" className={styles.actionButton}> <FaEdit /> Edit </Button>
          <Button variant="danger" onClick={() => handleDeleteGatepass(item.id)} title="Delete Record" className={styles.actionButton}> <FaTrashAlt /> Delete </Button>
        </div>
      )
    }
  ], [handleOpenEditModal, handleDeleteGatepass]);

  // --- Effect for Special Note Reminder ---
  useEffect(() => {
    if (gatepasses && gatepasses.length > 0) {
      const today = startOfDay(new Date());
      const notesForToday = gatepasses
        .filter(gp => {
            try {
                // Check if noteDate is valid and matches today
                return gp.specialNote && gp.noteDate && isValid(parseISO(gp.noteDate)) && isToday(parseISO(gp.noteDate));
            } catch {
                return false;
            }
        })
        .map(gp => `- ${gp.category} (${gp.id}): ${gp.specialNote}`) // Format the notes
        .join('\n'); // Join multiple notes with newlines

      if (notesForToday) {
        // Use alert for simplicity. Replace with a toast notification later.
        alert(`Today's Gatepass Reminders:\n${notesForToday}`);
      }
    }
    // Run only when gatepasses data changes
  }, [gatepasses]);


  return (
    <div className={styles.gatepassPage}>
      <header className={styles.header}>
        <h1>Gatepass Management</h1>
         <div className={styles.headerActions}>
             <Button variant="secondary" onClick={handleExport} style={{ marginRight: '1rem' }}>
                <FaFileExcel /> Export Filtered
             </Button>
             <Button variant="primary" onClick={handleOpenAddModal}>
                 <FaPlus /> Add Gatepass
             </Button>
        </div>
      </header>

       {/* --- Filter Section --- */}
       <section className={styles.filterSection}>
           <FaFilter className={styles.filterIcon}/>
           <InputField label="Filter Start Date (Receive/Send)" id="filter-start-date" name="filterStartDate" type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className={styles.filterInputGroup} />
           <InputField label="Filter End Date (Receive/Send)" id="filter-end-date" name="filterEndDate" type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className={styles.filterInputGroup} />
           {/* Add other filters if needed */}
       </section>

      {isLoading && <LoadingSpinner />}
      {error && <p className={styles.error}>Error loading gatepass data: {error}</p>}

      {!isLoading && !error && (
        <Table
          columns={gatepassColumns}
          data={filteredGatepasses || []} // Use filtered data
          keyField="id"
        />
      )}

       {/* --- Add/Edit Gatepass Modal --- */}
       <Modal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setEditingGatepass(null); }}
          title={editingGatepass ? 'Edit Gatepass Record' : 'Add New Gatepass Record'}
       >
           <GatepassForm
               onSubmit={handleFormSubmit} // Single submit handler
               onCancel={() => { setShowModal(false); setEditingGatepass(null); }}
               initialData={editingGatepass}
               isLoading={isSubmitting}
           />
       </Modal>

    </div>
  );
};

export default Gatepass;