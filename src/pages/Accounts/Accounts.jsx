// src/pages/Accounts/Accounts.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa';
import useMockApi from '../../hooks/useMockApi';
import {
    getWeeklySummary,
    getAccountRecords,
    addAccountRecord,
    updateAccountRecord,
    deleteAccountRecord
} from '../../services/api'; // Import all needed API functions
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner.jsx';
import Button from '../../components/Button/Button.jsx';
import Table from '../../components/Table/Table.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import AccountRecordForm from './AccountRecordForm.jsx'; // Import the new form
import SalaryCalculator from './SalaryCalculator.jsx'; // Import the calculator
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format, parseISO, startOfDay, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import styles from './Accounts.module.css';

const Accounts = () => {
  // --- State ---
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  // const [isSubmittingRecord, setIsSubmittingRecord] = useState(false); // Optional

  // --- Data Fetching ---
  const { data: weeklySummary, isLoading: isLoadingSummary, error: errorSummary } = useMockApi(getWeeklySummary, [], { credit: 0, debit: 0 });
  // Renamed refresh function for account records to avoid naming conflict
  const { data: accountRecords, isLoading: isLoadingRecords, error: errorRecords, refresh: refreshAccountRecords } = useMockApi(getAccountRecords, [], []);

  const isLoading = isLoadingSummary || isLoadingRecords;
  const error = errorSummary || errorRecords;

  // --- Handlers for Manual Records ---
  const handleAddRecord = useCallback(async (formData) => {
    // setIsSubmittingRecord(true);
    try {
      await addAccountRecord(formData);
      refreshAccountRecords(); // Use the specific refresh function
      setShowRecordModal(false);
    } catch (err) {
      console.error("Failed to add record:", err);
      alert(`Error: ${err.message || 'Failed to add record'}`);
    } finally {
      // setIsSubmittingRecord(false);
    }
  }, [refreshAccountRecords]);

  const handleEditRecord = useCallback((record) => {
    setEditingRecord(record);
    setShowRecordModal(true);
  }, []);

  const handleUpdateRecord = useCallback(async (formData) => {
    if (!editingRecord) return;
    // setIsSubmittingRecord(true);
    try {
      await updateAccountRecord(editingRecord.id, formData);
      refreshAccountRecords();
      setShowRecordModal(false);
      setEditingRecord(null);
    } catch (err) {
      console.error("Failed to update record:", err);
      alert(`Error: ${err.message || 'Failed to update record'}`);
    } finally {
      // setIsSubmittingRecord(false);
    }
  }, [editingRecord, refreshAccountRecords]);

  const handleDeleteRecord = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this account record?')) {
      try {
        await deleteAccountRecord(id);
        refreshAccountRecords();
      } catch (err) {
        console.error("Failed to delete record:", err);
        alert(`Error: ${err.message || 'Failed to delete record'}`);
      }
    }
  }, [refreshAccountRecords]);

  // --- Data processing for Chart ---
  const chartData = useMemo(() => {
    if (!accountRecords || accountRecords.length === 0) return [];
    const today = startOfDay(new Date(2025, 4, 2)); // Use context date
    const sevenDaysAgo = subDays(today, 6);
    const dateInterval = { start: sevenDaysAgo, end: today };

    const recentRecords = accountRecords.filter(record => {
      try {
        const recordDate = startOfDay(parseISO(record.date));
        return recordDate >= sevenDaysAgo && recordDate <= today;
      } catch { return false; }
    });

    const allDatesInRange = eachDayOfInterval(dateInterval);

    return allDatesInRange.map(date => {
      const recordsForDay = recentRecords.filter(record =>
        isSameDay(startOfDay(parseISO(record.date)), date)
      );
      const dailyCredit = recordsForDay.filter(r => r.type === 'credit').reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      const dailyDebit = recordsForDay.filter(r => r.type === 'debit').reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      return { date: format(date, 'MMM d'), credit: dailyCredit, debit: dailyDebit };
    });
  }, [accountRecords]);

  // --- Define Columns for the Account Records Table ---
  const accountRecordColumns = useMemo(() => [
    {
      key: 'date',
      label: 'Date',
      render: (value) => {
          try { return format(parseISO(value), 'PP'); }
          catch { return 'Invalid Date'; }
      }
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => (
        <span className={`${styles.recordType} ${styles[value]}`}>
          {value === 'credit' ? 'Credit' : 'Debit'}
        </span>
      )
    },
    { key: 'description', label: 'Description' },
    {
      key: 'amount',
      label: 'Amount',
      render: (value, row) => (
        <span style={{ color: row.type === 'credit' ? 'var(--success-color)' : 'var(--danger-color)' }}>
           {row.type === 'debit' ? '-' : ''}Rs. {Number(value).toFixed(2)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, record) => (
        <div className={styles.actionButtons}>
          <Button
            variant="secondary"
            onClick={() => handleEditRecord(record)}
            title="Edit Record"
            className={styles.actionButton}
          > <FaEdit /> </Button>
          <Button
            variant="danger"
            onClick={() => handleDeleteRecord(record.id)}
            title="Delete Record"
            className={styles.actionButton}
          > <FaTrashAlt /> </Button>
        </div>
      )
    }
  ], [handleEditRecord, handleDeleteRecord]); // Add dependencies

  return (
    <div className={styles.accountsPage}>
      <header className={styles.header}>
        <h1>Accounts Management</h1>
        <Button
            variant="primary"
            onClick={() => { setEditingRecord(null); setShowRecordModal(true); }}
        >
           <FaPlus /> Add Record
        </Button>
      </header>

      {isLoading && <LoadingSpinner />}
      {error && <p className={styles.error}>Error loading account data: {error}</p>}

      {!isLoading && !error && (
        <>
          {/* --- Weekly Summary Section --- */}
          <section className={styles.summarySection}>
            <h2>Weekly Summary</h2>
            <div className={styles.summaryContainer}>
               {weeklySummary ? (
                   <>
                       <div className={`${styles.summaryCard} ${styles.credit}`}>
                           <span className={styles.summaryLabel}>Total Credit (Last 7 Days)</span>
                           <span className={styles.summaryValue}>Rs. {weeklySummary.credit?.toFixed(2) ?? '0.00'}</span>
                       </div>
                       <div className={`${styles.summaryCard} ${styles.debit}`}>
                           <span className={styles.summaryLabel}>Total Debit (Last 7 Days)</span>
                           <span className={styles.summaryValue}>Rs. {weeklySummary.debit?.toFixed(2) ?? '0.00'}</span>
                       </div>
                   </>
               ) : ( <p>Could not load summary.</p> )}
            </div>
          </section>

          {/* --- Chart Section --- */}
          <section className={styles.chartSection}>
            <h2>Income vs Expenses (Last 7 Days)</h2>
            <div className={styles.chartContainer}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `Rs.${value}`} />
                    <Tooltip cursor={{ fill: 'rgba(233, 236, 239, 0.3)' }} formatter={(value, name) => [`Rs. ${Number(value).toFixed(2)}`, name]} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="credit" name="Income (Credit)" fill="var(--success-color)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="debit" name="Expenses (Debit)" fill="var(--danger-color)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : ( <p>No transaction data available for the chart period.</p> )}
            </div>
          </section>

          {/* --- Manual Records List Section --- */}
          <section className={styles.recordsSection}>
            <div className={styles.sectionHeader}> {/* Added header for table section */}
                 <h2>Account Records</h2>
                 {/* Maybe move Add Record button here? */}
            </div>
             <Table
                columns={accountRecordColumns}
                data={accountRecords || []} // Pass fetched records
                isLoading={isLoadingRecords} // Pass loading state specific to records
                keyField="id"
             />
          </section>

          {/* --- Salary Calculator Section --- */}
          <section className={styles.salarySection}>
            <h2>Salary Calculator</h2>
            <SalaryCalculator /> {/* Render the component */}
          </section>

          {/* --- Add/Edit Record Modal --- */}
          <Modal
              isOpen={showRecordModal}
              onClose={() => { setShowRecordModal(false); setEditingRecord(null); }}
              title={editingRecord ? 'Edit Account Record' : 'Add New Account Record'}
          >
              <AccountRecordForm
                  onSubmit={editingRecord ? handleUpdateRecord : handleAddRecord}
                  onCancel={() => { setShowRecordModal(false); setEditingRecord(null); }}
                  initialData={editingRecord}
                  // isLoading={isSubmittingRecord} // Optional
              />
          </Modal>
        </>
      )}
    </div>
  );
};

export default Accounts;