// src/pages/Employers/Employers.jsx
import React, { useState, useCallback } from 'react';
import { FaPlus } from 'react-icons/fa';
import useMockApi from '../../hooks/useMockApi';
import { getEmployers, addEmployer, updateEmployer, deleteEmployer } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner.jsx';
import Button from '../../components/Button/Button.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import EmployerCard from './EmployerCard.jsx'; // Import the card component
import EmployerForm from './EmployerForm.jsx'; // Import the form component
import styles from './Employers.module.css';

const Employers = () => {
  const { data: employers, isLoading, error, refresh: refreshEmployers } = useMockApi(getEmployers, [], []);
  const [showEmployerModal, setShowEmployerModal] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState(null);
  // const [isSubmitting, setIsSubmitting] = useState(false); // Optional

  // --- Handlers ---
  const handleAddEmployer = useCallback(async (formData) => {
    // setIsSubmitting(true);
    try {
      await addEmployer(formData);
      refreshEmployers();
      setShowEmployerModal(false);
    } catch (err) {
      console.error("Failed to add employer:", err);
      alert(`Error: ${err.message || 'Failed to add employer'}`);
    } finally {
      // setIsSubmitting(false);
    }
  }, [refreshEmployers]);

  const handleEditEmployer = useCallback((employer) => {
    setEditingEmployer(employer);
    setShowEmployerModal(true);
  }, []);

  const handleUpdateEmployer = useCallback(async (formData) => {
    if (!editingEmployer) return;
    // setIsSubmitting(true);
    try {
      await updateEmployer(editingEmployer.id, formData);
      refreshEmployers();
      setShowEmployerModal(false);
      setEditingEmployer(null);
    } catch (err) {
      console.error("Failed to update employer:", err);
      alert(`Error: ${err.message || 'Failed to update employer'}`);
    } finally {
      // setIsSubmitting(false);
    }
  }, [editingEmployer, refreshEmployers]);

  const handleDeleteEmployer = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this employer? This action cannot be undone.')) {
      try {
        await deleteEmployer(id);
        refreshEmployers();
      } catch (err) {
        console.error("Failed to delete employer:", err);
        alert(`Error: ${err.message || 'Failed to delete employer'}`);
      }
    }
  }, [refreshEmployers]);

  return (
    <div className={styles.employersPage}>
      <header className={styles.header}>
        <h1>Employers Management</h1>
        <Button
          variant="primary"
          onClick={() => { setEditingEmployer(null); setShowEmployerModal(true); }}
        >
          <FaPlus /> Add Employer
        </Button>
      </header>

      {isLoading && <LoadingSpinner />}
      {error && <p className={styles.error}>Error loading employers: {error}</p>}

      {!isLoading && !error && (
        <div className={styles.cardGrid}>
          {employers && employers.length > 0 ? (
            employers.map(emp => (
              <EmployerCard
                key={emp.id}
                employer={emp}
                onEdit={handleEditEmployer}
                onDelete={handleDeleteEmployer}
              />
            ))
          ) : (
            <p>No employers found. Add one to get started!</p>
          )}
        </div>
      )}

      {/* Add/Edit Employer Modal */}
      <Modal
          isOpen={showEmployerModal}
          onClose={() => { setShowEmployerModal(false); setEditingEmployer(null); }}
          title={editingEmployer ? 'Edit Employer Details' : 'Add New Employer'}
      >
          <EmployerForm
              onSubmit={editingEmployer ? handleUpdateEmployer : handleAddEmployer}
              onCancel={() => { setShowEmployerModal(false); setEditingEmployer(null); }}
              initialData={editingEmployer}
              // isLoading={isSubmitting} // Optional
          />
      </Modal>
    </div>
  );
};

export default Employers;