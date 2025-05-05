// src/pages/Outstanding/Outstanding.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { FaFilter, FaEdit, FaTrashAlt, FaPlus, FaFileExcel } from 'react-icons/fa'; // Added icons
import useMockApi from '../../hooks/useMockApi';
// Import all needed API functions
import { getOutstanding, addOutstanding, updateOutstanding, deleteOutstanding } from '../../services/api';
import { exportOutstandingToExcel } from '../../utils/exportUtils.jsx'; // Import excel function
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner.jsx';
import Table from '../../components/Table/Table.jsx';
import Button from '../../components/Button/Button.jsx';
import InputField from '../../components/InputField/InputField.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import OutstandingForm from './OutstandingForm.jsx'; // Import the new form
import styles from './Outstanding.module.css';
import { format, parseISO, startOfDay, isValid } from 'date-fns';

const Outstanding = () => {
  const { data: outstandingList, isLoading, error, refresh: refreshOutstanding } = useMockApi(getOutstanding, [], []);

  // State for Active Tab ('payable' or 'receivable')
  const [activeTab, setActiveTab] = useState('payable'); // Default to Payables

  // State for Filters
  const [filterName, setFilterName] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // State for Modals (Add/Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null); // Use for both add/edit check
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Filtering Logic (Applies to the full list first) ---
  const baseFilteredList = useMemo(() => {
     if (!outstandingList) return [];
     return outstandingList.filter(item => {
        // Apply name and date filters first
        let itemDate;
        try { itemDate = item.date && isValid(parseISO(item.date)) ? startOfDay(parseISO(item.date)) : null; } catch { itemDate = null; }
        const nameMatch = filterName ? item.name?.toLowerCase().includes(filterName.toLowerCase()) : true;
        let startDateMatch = true;
        if (filterStartDate && isValid(new Date(filterStartDate))) { startDateMatch = itemDate ? itemDate >= startOfDay(new Date(filterStartDate)) : false; }
        let endDateMatch = true;
        if (filterEndDate && isValid(new Date(filterEndDate))) { endDateMatch = itemDate ? itemDate <= startOfDay(new Date(filterEndDate)) : false; }
        return nameMatch && startDateMatch && endDateMatch;
      });
  }, [outstandingList, filterName, filterStartDate, filterEndDate]);

  // --- Filter further based on Active Tab ---
  const displayedData = useMemo(() => {
      return baseFilteredList.filter(item => item.type === activeTab);
  }, [baseFilteredList, activeTab]);


  // --- Handlers ---
  const handleAddRecord = useCallback(async (formData) => {
    setIsSubmitting(true);
    try {
      await addOutstanding(formData); // Call add API
      refreshOutstanding();
      setShowModal(false);
    } catch (err) {
      console.error("Failed to add outstanding record:", err);
      alert(`Error: ${err.message || 'Failed to add record'}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshOutstanding]);

  const handleOpenEditModal = useCallback((record) => {
    setEditingRecord(record); // Set the record to edit
    setShowModal(true); // Open the modal
  }, []);

   const handleOpenAddModal = useCallback(() => {
    setEditingRecord(null); // Clear editing record for Add mode
    setShowModal(true); // Open the modal
  }, []);

  const handleUpdateRecord = useCallback(async (formData) => {
     if (!editingRecord) return;
     setIsSubmitting(true);
     try {
         await updateOutstanding(editingRecord.id, formData); // Call update API
         refreshOutstanding();
         setShowModal(false);
         setEditingRecord(null);
     } catch (err) {
         console.error("Failed to update outstanding record:", err);
         alert(`Error: ${err.message || 'Failed to update record'}`);
     } finally {
         setIsSubmitting(false);
     }
  }, [editingRecord, refreshOutstanding]);

   const handleDeleteRecord = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this outstanding record?')) {
      try {
        await deleteOutstanding(id); // Call delete API
        refreshOutstanding();
      } catch (err) {
        console.error("Failed to delete outstanding record:", err);
        alert(`Error: ${err.message || 'Failed to delete record'}`);
      }
    }
  }, [refreshOutstanding]);

  const handleExport = useCallback(() => {
      const dataToExport = displayedData; // Export data from the active tab
      if (!dataToExport || dataToExport.length === 0) {
          alert(`No ${activeTab === 'payable' ? 'Payables' : 'Receivables'} data available to export.`);
          return;
      }
      const typeName = activeTab === 'payable' ? 'Payables' : 'Receivables';
      const fileName = `outstanding_${typeName}_${format(new Date(), 'yyyyMMdd')}.xlsx`;
      exportOutstandingToExcel(dataToExport, activeTab, fileName);

  }, [displayedData, activeTab]);


  // --- Define Columns for the Outstanding Table ---
  const outstandingColumns = useMemo(() => [
    // { key: 'type', label: 'Type', render: (v) => v === 'payable' ? 'Payable' : 'Receivable' }, // Type shown by Tab
    { key: 'name', label: 'Name (Supplier/Buyer)' },
    { key: 'description', label: 'Description' },
    { key: 'amount', label: 'Amount', render: (v) => `Rs. ${Number(v || 0).toFixed(2)}` },
    { key: 'date', label: 'Due/Record Date', render: (v) => { try { return v ? format(parseISO(v), 'PP') : 'N/A'; } catch { return 'Invalid Date'; } } },
    { key: 'status', label: 'Status', render: (v) => { const s = String(v||'pending').toLowerCase().replace(' ','_'); return (<span className={`${styles.status} ${styles[s]}`}>{v || 'Pending'}</span>); } },
    {
      key: 'actions', label: 'Actions',
      render: (_, item) => (
        <div className={styles.actionButtons}>
          <Button variant="secondary" onClick={() => handleOpenEditModal(item)} title="Edit Record" className={styles.actionButton}> <FaEdit /> Edit </Button>
          <Button variant="danger" onClick={() => handleDeleteRecord(item.id)} title="Delete Record" className={styles.actionButton}> <FaTrashAlt /> Delete </Button>
        </div>
      )
    }
  ], [handleOpenEditModal, handleDeleteRecord]); // Dependencies


  return (
    <div className={styles.outstandingPage}>
      <header className={styles.header}>
        <h1>Outstanding Balances</h1>
        <div className={styles.headerActions}>
             <Button variant="secondary" onClick={handleExport} style={{ marginRight: '1rem' }}>
                <FaFileExcel /> Export {activeTab === 'payable' ? 'Payables' : 'Receivables'}
             </Button>
             <Button variant="primary" onClick={handleOpenAddModal}>
                 <FaPlus /> Add Record
             </Button>
        </div>
      </header>

       {/* --- Tabs --- */}
        <div className={styles.tabContainer}>
            <button
                className={`${styles.tabButton} ${activeTab === 'payable' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('payable')}
            >
                Payables (Suppliers)
            </button>
            <button
                className={`${styles.tabButton} ${activeTab === 'receivable' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('receivable')}
            >
                Receivables (Buyers/Clients)
            </button>
        </div>

       {/* --- Filter Section --- */}
       <section className={styles.filterSection}>
           <FaFilter className={styles.filterIcon}/>
           <InputField label="Filter by Name" id="filter-name" name="filterName" value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="Enter name..." className={styles.filterInputGroup} />
           <InputField label="Start Date" id="filter-start-date" name="filterStartDate" type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className={styles.filterInputGroup} />
           <InputField label="End Date" id="filter-end-date" name="filterEndDate" type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className={styles.filterInputGroup} />
       </section>

      {isLoading && <LoadingSpinner />}
      {error && <p className={styles.error}>Error loading outstanding data: {error}</p>}

      {!isLoading && !error && (
        <Table
          columns={outstandingColumns}
          data={displayedData || []} // Use data filtered by tab
          keyField="id"
        />
      )}

       {/* --- Add/Edit Outstanding Modal --- */}
       <Modal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setEditingRecord(null); }}
          title={editingRecord ? 'Edit Outstanding Record' : 'Add New Outstanding Record'}
       >
           <OutstandingForm
               onSubmit={editingRecord ? handleUpdateRecord : handleAddRecord}
               onCancel={() => { setShowModal(false); setEditingRecord(null); }}
               initialData={editingRecord} // Pass null for adding
               isLoading={isSubmitting}
           />
       </Modal>

    </div>
  );
};

export default Outstanding;