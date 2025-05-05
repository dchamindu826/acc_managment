// src/pages/Gatepass/GatepassForm.jsx
import React, { useState, useEffect } from 'react';
import InputField from '../../components/InputField/InputField.jsx';
import Button from '../../components/Button/Button.jsx';
import styles from './GatepassForm.module.css'; // Create this CSS file next

const GatepassForm = ({ onSubmit, onCancel, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    receiveDate: '',
    sendDate: '',
    category: '',
    invoiceNumber: '',
    remarks: '',
    quantity: '',
    specialNote: '',
    noteDate: '',
  });

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        receiveDate: initialData.receiveDate ? initialData.receiveDate.substring(0, 10) : '',
        sendDate: initialData.sendDate ? initialData.sendDate.substring(0, 10) : '',
        category: initialData.category || '',
        invoiceNumber: initialData.invoiceNumber || '',
        remarks: initialData.remarks || '',
        quantity: initialData.quantity || '',
        specialNote: initialData.specialNote || '',
        noteDate: initialData.noteDate ? initialData.noteDate.substring(0, 10) : '',
      });
    } else {
      // Reset form for adding, default receive date to today
      setFormData({
        receiveDate: new Date().toISOString().substring(0, 10),
        sendDate: '',
        category: '',
        invoiceNumber: '',
        remarks: '',
        quantity: '',
        specialNote: '',
        noteDate: '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.receiveDate || !formData.category) {
      alert("Please fill in Receive Date and Category.");
      return;
    }
    // Pass back all form data (API will handle formatting/nulls)
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.gatepassForm}>
      <div className={styles.formGrid}>
        <InputField label="Receive Date" name="receiveDate" type="date" value={formData.receiveDate} onChange={handleChange} required />
        <InputField label="Send Date (Optional)" name="sendDate" type="date" value={formData.sendDate} onChange={handleChange} />
        <InputField label="Category" name="category" value={formData.category} onChange={handleChange} required placeholder="e.g., Raw Material In, Finished Goods Out" />
        <InputField label="Invoice No (Optional)" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} placeholder="e.g., INV-123, PO-456" />
        <InputField label="Quantity" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="e.g., 10 barrels, 5 boxes" />
        {/* Remarks and Special Note span full width */}
        <InputField label="Remarks" name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Brief description..." className={styles.fullWidthField} />
        <InputField label="Special Note (Optional)" name="specialNote" value={formData.specialNote} onChange={handleChange} placeholder="Reminder text..." className={styles.fullWidthField} />
        <InputField label="Note Reminder Date (Optional)" name="noteDate" type="date" value={formData.noteDate} onChange={handleChange} className={styles.fullWidthField} />
      </div>

      <div className={styles.formActions}>
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
          {isEditing ? 'Update Gatepass' : 'Save Gatepass'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default GatepassForm;