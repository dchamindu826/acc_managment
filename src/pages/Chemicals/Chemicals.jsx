// src/pages/Chemicals/Chemicals.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { FaPlus, FaEdit, FaShoppingCart, FaMinusCircle, FaFlask } from 'react-icons/fa'; // Added FaFlask
import useMockApi from '../../hooks/useMockApi';
// Import NEW API function addChemicalType
import {
    getChemicals,
    addChemicalPurchase,
    updateChemical,
    recordChemicalUsage,
    addChemicalType // Import the new API function
} from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner.jsx';
import Table from '../../components/Table/Table.jsx';
import Button from '../../components/Button/Button.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import ChemicalPurchaseForm from './ChemicalPurchaseForm.jsx';
import ChemicalEditForm from './ChemicalEditForm.jsx';
import ChemicalUsageForm from './ChemicalUsageForm.jsx';
import ChemicalTypeForm from './ChemicalTypeForm.jsx'; // Import the new type form
import styles from './Chemicals.module.css';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

const Chemicals = () => {
  const { data: chemicals, isLoading, error, refresh: refreshChemicals } = useMockApi(getChemicals, [], []);

  // State for Modals
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchasingChemical, setPurchasingChemical] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingChemical, setEditingChemical] = useState(null);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [usageChemical, setUsageChemical] = useState(null);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false); // --> New state for Add Type Modal
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Handlers ---
  const handleOpenPurchaseModal = useCallback((chemical) => {
    setPurchasingChemical(chemical);
    setShowPurchaseModal(true);
  }, []);

  const handleAddPurchase = useCallback(async (formData) => {
    if (!purchasingChemical) return;
    setIsSubmitting(true);
    try {
        await addChemicalPurchase({ chemicalId: purchasingChemical.id, ...formData });
        refreshChemicals();
        setShowPurchaseModal(false);
        setPurchasingChemical(null);
    } catch (err) {
        console.error("Failed to add purchase:", err);
        alert(`Error: ${err.message || 'Failed to add purchase'}`);
    } finally {
       setIsSubmitting(false);
    }
  }, [purchasingChemical, refreshChemicals]);

  const handleOpenEditModal = useCallback((chemical) => {
    setEditingChemical(chemical);
    setShowEditModal(true);
  }, []);

  const handleUpdateChemical = useCallback(async (formData) => {
    if (!editingChemical) return;
    setIsSubmitting(true);
     try {
        await updateChemical(editingChemical.id, formData);
        refreshChemicals();
        setShowEditModal(false);
        setEditingChemical(null);
     } catch (err) {
        console.error("Failed to update chemical:", err);
         alert(`Error: ${err.message || 'Failed to update chemical'}`);
     } finally {
        setIsSubmitting(false);
     }
  }, [editingChemical, refreshChemicals]);

  const handleOpenUsageModal = useCallback((chemical) => {
    setUsageChemical(chemical);
    setShowUsageModal(true);
  }, []);

  const handleRecordUsage = useCallback(async (formData) => {
      if (!usageChemical) return;
      setIsSubmitting(true);
      try {
          await recordChemicalUsage(usageChemical.id, formData);
          refreshChemicals();
          setShowUsageModal(false);
          setUsageChemical(null);
      } catch (err) {
          console.error("Failed to record usage:", err);
          alert(`Error: ${err.message || 'Failed to record usage'}`);
      } finally {
          setIsSubmitting(false);
      }
  }, [usageChemical, refreshChemicals]);

  // --- NEW Handler for Adding Chemical Type ---
  const handleAddChemicalType = useCallback(async (formData) => {
      setIsSubmitting(true);
      try {
          await addChemicalType(formData); // Call the new API function
          refreshChemicals();
          setShowAddTypeModal(false); // Close the correct modal
      } catch (err) {
          console.error("Failed to add chemical type:", err);
          alert(`Error: ${err.message || 'Failed to add chemical type'}`);
      } finally {
          setIsSubmitting(false);
      }
  }, [refreshChemicals]);


  // --- Define Columns for the Chemicals Table ---
  const chemicalColumns = useMemo(() => [
    { key: 'name', label: 'Chemical Name' },
    {
      key: 'stock',
      label: 'Current Stock',
      render: (_, chemical) => `${chemical.quantity || 0} ${chemical.unit || ''}`
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      render: (value) => {
        try { return value ? formatDistanceToNow(parseISO(value), { addSuffix: true }) : 'N/A'; }
        catch { return 'Invalid Date'; }
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, chemical) => (
        <div className={styles.actionButtons}>
          <Button variant="primary" onClick={() => handleOpenPurchaseModal(chemical)} title="Add Purchase / Update Stock" className={styles.actionButton}>
            <FaShoppingCart /> Add Purchase
          </Button>
           <Button variant="warning" onClick={() => handleOpenUsageModal(chemical)} title="Record Stock Usage" className={styles.actionButton} >
             <FaMinusCircle /> Record Usage
           </Button>
          <Button variant="secondary" onClick={() => handleOpenEditModal(chemical)} title="Edit Chemical Details" className={styles.actionButton} >
            <FaEdit /> Edit
          </Button>
        </div>
      )
    }
  ], [handleOpenPurchaseModal, handleOpenUsageModal, handleOpenEditModal]);


  return (
    <div className={styles.chemicalsPage}>
      <header className={styles.header}>
        <h1>Chemical Stock Management</h1>
        {/* --- NEW Button to Add Chemical Type --- */}
        <Button
          variant="primary"
          onClick={() => setShowAddTypeModal(true)} // Open the new modal
        >
          <FaFlask /> Add New Chemical Type
        </Button>
      </header>

      {isLoading && <LoadingSpinner />}
      {error && <p className={styles.error}>Error loading chemical data: {error}</p>}

      {!isLoading && !error && (
        <Table
          columns={chemicalColumns}
          data={chemicals || []}
          keyField="id"
        />
      )}

      {/* --- Add Purchase Modal --- */}
       <Modal isOpen={showPurchaseModal} onClose={() => { setShowPurchaseModal(false); setPurchasingChemical(null); }} title={`Add Purchase for ${purchasingChemical?.name || ''}`} >
           <ChemicalPurchaseForm onSubmit={handleAddPurchase} onCancel={() => { setShowPurchaseModal(false); setPurchasingChemical(null); }} chemicalName={purchasingChemical?.name} chemicalUnit={purchasingChemical?.unit} isLoading={isSubmitting} />
       </Modal>

      {/* --- Edit Chemical Modal --- */}
       <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingChemical(null); }} title={`Edit Chemical: ${editingChemical?.name || ''}`} >
           <ChemicalEditForm onSubmit={handleUpdateChemical} onCancel={() => { setShowEditModal(false); setEditingChemical(null); }} initialData={editingChemical} isLoading={isSubmitting}/>
       </Modal>

       {/* --- Record Usage Modal --- */}
       <Modal isOpen={showUsageModal} onClose={() => { setShowUsageModal(false); setUsageChemical(null); }} title={`Record Usage for ${usageChemical?.name || ''}`} >
           <ChemicalUsageForm onSubmit={handleRecordUsage} onCancel={() => { setShowUsageModal(false); setUsageChemical(null); }} chemicalName={usageChemical?.name} chemicalUnit={usageChemical?.unit} currentStock={usageChemical?.quantity} isLoading={isSubmitting} />
       </Modal>

       {/* --- NEW Add Chemical Type Modal --- */}
       <Modal isOpen={showAddTypeModal} onClose={() => setShowAddTypeModal(false)} title="Add New Chemical Type" >
           <ChemicalTypeForm onSubmit={handleAddChemicalType} onCancel={() => setShowAddTypeModal(false)} isLoading={isSubmitting} />
       </Modal>

    </div>
  );
};

export default Chemicals;