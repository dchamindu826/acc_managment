// src/pages/Payments/Payments.jsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  FaPlus, FaFilter, FaFilePdf, FaFileExcel, FaEdit, FaTrashAlt
} from 'react-icons/fa';
import useMockApi from '../../hooks/useMockApi';
import { getPayments, addPayment, deletePayment, updatePayment } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner.jsx';
import Table from '../../components/Table/Table.jsx';
import Button from '../../components/Button/Button.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import PaymentForm from './PaymentForm.jsx';
import { generateVoucherPdf } from '../../utils/exportUtils.jsx'; // Changed extension to .jsx

import styles from './Payments.module.css';
import { format, parseISO, startOfDay } from 'date-fns';


const Payments = () => {
  const { data: payments, isLoading, error, setData: setPayments, refresh } = useMockApi(getPayments, [], []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // State to track which voucher is being generated
  const [generatingVoucherId, setGeneratingVoucherId] = useState(null);
  // const [isSubmitting, setIsSubmitting] = useState(false); // Optional: for form loading state

  // --- Handlers ---
  const handleAddPayment = useCallback(async (formData) => {
    // setIsSubmitting(true);
    try {
      await addPayment(formData);
      refresh();
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to add payment:", err);
      alert(`Error: ${err.message || 'Failed to add payment'}`);
    } finally {
      // setIsSubmitting(false);
    }
  }, [refresh]);

  const handleEditPayment = useCallback((payment) => {
    setEditingPayment(payment);
    setShowAddModal(true);
  }, []);

  const handleUpdatePayment = useCallback(async (formData) => {
    if (!editingPayment) return;
    // setIsSubmitting(true);
    try {
      await updatePayment(editingPayment.id, formData);
      refresh();
      setShowAddModal(false);
      setEditingPayment(null);
    } catch (err) {
      console.error("Failed to update payment:", err);
      alert(`Error: ${err.message || 'Failed to update payment'}`);
    } finally {
      // setIsSubmitting(false);
    }
  }, [editingPayment, refresh]);

  const handleDeletePayment = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await deletePayment(id);
        refresh();
      } catch (err) {
        console.error("Failed to delete payment:", err);
        alert(`Error: ${err.message || 'Failed to delete payment'}`);
      }
    }
  }, [refresh]);

  // *** === UPDATED Voucher Handler === ***
  const handleGenerateVoucher = useCallback(async (payment) => {
    if (generatingVoucherId) return; // Prevent clicking if already generating

    setGeneratingVoucherId(payment.id); // Set loading state for this specific payment
    console.log(`Generating voucher for ID: ${payment.id}`);
    try {
      await generateVoucherPdf(payment); // Call the async utility function
      // Optionally show success message
    } catch (error) {
      // Error is likely already logged and alerted in generateVoucherPdf
      console.error("Voucher generation failed in component:", error);
    } finally {
      setGeneratingVoucherId(null); // Remove loading state regardless of success/failure
    }
  }, [generatingVoucherId]); // Added generatingVoucherId as dependency

  const handleExportExcel = useCallback(() => {
    const dataToExport = filteredPayments;
    if (!dataToExport || dataToExport.length === 0) {
        alert("No data available to export.");
        return;
    }
    console.log("Exporting payments:", dataToExport);
    alert("Excel export feature coming soon!");
  }, [/* filteredPayments needed here */]); // Add dependency if using filteredPayments

  // --- Filtering Logic ---
  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    try {
        return payments.filter(p => {
            const paymentDate = p.date ? startOfDay(parseISO(p.date)) : null;
            if (!paymentDate) return false;

            const nameMatch = filterName ? p.forWhom?.toLowerCase().includes(filterName.toLowerCase()) : true;
            const start = filterStartDate ? startOfDay(parseISO(filterStartDate)) : null;
            const end = filterEndDate ? startOfDay(parseISO(filterEndDate)) : null;
            const startDateMatch = start ? paymentDate >= start : true;
            const endDateMatch = end ? paymentDate <= end : true;

            return nameMatch && startDateMatch && endDateMatch;
        });
    } catch (parseError) {
        console.error("Date parsing error in filter:", parseError);
        return payments;
    }
  }, [payments, filterName, filterStartDate, filterEndDate]);

  // --- Grouping Logic ---
  const groupedPayments = useMemo(() => {
    return filteredPayments.reduce((acc, payment) => {
      try {
          const dateStr = format(parseISO(payment.date), 'yyyy-MM-dd');
          if (!acc[dateStr]) {
              acc[dateStr] = [];
          }
          acc[dateStr].push(payment);
          return acc;
      } catch (parseError) {
          console.error("Date parsing error in grouping:", parseError, payment);
          return acc;
      }
    }, {});
  }, [filteredPayments]);

  // Sort group keys (dates)
  const sortedGroupKeys = useMemo(() => Object.keys(groupedPayments).sort((a, b) => parseISO(b) - parseISO(a)), [groupedPayments]);

  // --- Define Columns for the Table ---
   const paymentColumns = useMemo(() => [
    {
      key: 'date',
      label: 'Date',
      render: (value) => {
          try { return format(parseISO(value), 'PP'); }
          catch { return 'Invalid Date'; }
      }
    },
    { key: 'reason', label: 'Reason' },
    { key: 'forWhom', label: 'For Whom' },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => `Rs. ${Number(value).toFixed(2)}` // Currency is Rs.
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, payment) => (
        <div className={styles.actionButtons}>
          <Button
            variant="secondary"
            onClick={() => handleGenerateVoucher(payment)} // Calls updated handler
            title="Generate Voucher"
            aria-label={`Generate voucher for ${payment.forWhom}`}
            className={styles.actionButton}
            // *** === Added Loading/Disabled Props === ***
            isLoading={generatingVoucherId === payment.id}
            disabled={generatingVoucherId === payment.id}
          >
            <FaFilePdf />
          </Button>
          <Button // Edit Button
            variant="secondary"
            onClick={() => handleEditPayment(payment)}
            title="Edit Payment"
            aria-label={`Edit payment for ${payment.forWhom}`}
            className={styles.actionButton}
            disabled={!!generatingVoucherId} // Disable if any voucher is generating
          >
            <FaEdit />
          </Button>
          <Button // Delete Button
            variant="danger"
            onClick={() => handleDeletePayment(payment.id)}
            title="Delete Payment"
            aria-label={`Delete payment for ${payment.forWhom}`}
            className={styles.actionButton}
            disabled={!!generatingVoucherId} // Disable if any voucher is generating
          >
            <FaTrashAlt />
          </Button>
        </div>
      )
    }
   ], [handleGenerateVoucher, handleEditPayment, handleDeletePayment, generatingVoucherId]); // Added generatingVoucherId dependency


  return (
    <div className={styles.paymentsPage}>
      <header className={styles.header}>
        <h1>Payments Management</h1>
        <Button
          variant="primary"
          onClick={() => { setEditingPayment(null); setShowAddModal(true); }}
        >
          <FaPlus /> Add Payment
        </Button>
      </header>

      {/* --- Filter Section --- */}
      <div className={styles.filterSection}>
         <FaFilter /> Filters:
         <input
           type="text"
           placeholder="Filter by name..."
           value={filterName}
           onChange={(e) => setFilterName(e.target.value)}
           className={styles.filterInput}
         />
         <input
           type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className={styles.filterInput}
         />
         <span>to</span>
         <input
           type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className={styles.filterInput}
         />
          <Button variant="secondary" onClick={handleExportExcel} className={styles.exportButton}>
              <FaFileExcel /> Export Selected
          </Button>
      </div>


      {isLoading && <LoadingSpinner />}
      {error && <p className={styles.error}>Error loading payments: {error}</p>}

      {/* --- Payments Display --- */}
      {!isLoading && !error && (
         <div className={styles.paymentsList}>
            {sortedGroupKeys.length === 0 && <p>No payments found matching your criteria.</p>}
             {sortedGroupKeys.map(dateKey => (
                 <div key={dateKey} className={styles.dayGroup}>
                     <h3 className={styles.dayHeader}>{format(parseISO(dateKey), 'EEEE, MMMM d, yyyy')}</h3> {/* Added yyyy for clarity */}
                     <Table
                        columns={paymentColumns}
                        data={groupedPayments[dateKey]}
                        isLoading={false}
                        keyField="id"
                     />
                 </div>
             ))}
         </div>
      )}

      {/* --- Add/Edit Modal --- */}
      <Modal
          isOpen={showAddModal}
          onClose={() => { setShowAddModal(false); setEditingPayment(null); }}
          title={editingPayment ? 'Edit Payment' : 'Add New Payment'}
      >
          <PaymentForm
              onSubmit={editingPayment ? handleUpdatePayment : handleAddPayment}
              onCancel={() => { setShowAddModal(false); setEditingPayment(null); }}
              initialData={editingPayment}
              // isLoading={isSubmitting} // Pass form submission loading state here if used
          />
      </Modal>

    </div>
  );
};

export default Payments;