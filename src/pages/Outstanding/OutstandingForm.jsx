// src/pages/Outstanding/OutstandingForm.jsx
import React, { useState, useEffect } from 'react';
import InputField from '../../components/InputField/InputField.jsx';
import Button from '../../components/Button/Button.jsx';
import styles from './OutstandingForm.module.css'; // Create this CSS file next

const OutstandingForm = ({ onSubmit, onCancel, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    type: 'payable', // Default to payable, user can change
    name: '',
    description: '',
    amount: '',
    date: '',
    status: 'Pending',
  });

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'payable',
        name: initialData.name || '',
        description: initialData.description || '',
        amount: initialData.amount || '',
        date: initialData.date ? initialData.date.substring(0, 10) : '',
        status: initialData.status || 'Pending',
      });
    } else {
      // Reset form for adding
      setFormData({
        type: 'payable',
        name: '',
        description: '',
        amount: '',
        date: new Date().toISOString().substring(0, 10), // Default to today
        status: 'Pending',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountValue = parseFloat(formData.amount);
    if (!formData.type || !formData.name || isNaN(amountValue) || amountValue < 0 || !formData.date || !formData.status) {
      alert("Please fill in Type, Name, valid Amount, Date, and Status.");
      return;
    }
    onSubmit({
        ...formData, // Submit all fields
        amount: amountValue,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.outstandingForm}>
       <div className={styles.formGrid}>
            {/* Type Selection - Only allow selection when adding? Or allow editing type? */}
            {/* Let's allow editing type for now */}
            <div className={styles.formField}>
                <label htmlFor="outstanding-type" className={styles.label}>Type</label>
                <select id="outstanding-type" name="type" value={formData.type} onChange={handleChange} required className={styles.selectInput} >
                    <option value="payable">Payable (To Supplier)</option>
                    <option value="receivable">Receivable (From Buyer/Client)</option>
                </select>
            </div>

            <InputField label="Name (Supplier/Buyer)" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Supplier Gamma or Client Alpha" />
            <InputField label="Description / Invoice #" name="description" value={formData.description} onChange={handleChange} placeholder="e.g., PO-102 or INV-003" />
            <InputField label="Amount (Rs.)" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} required min="0" />
            <InputField label="Due Date / Record Date" name="date" type="date" value={formData.date} onChange={handleChange} required />

            <div className={styles.formField}>
                <label htmlFor="outstanding-status" className={styles.label}>Status</label>
                <select id="outstanding-status" name="status" value={formData.status} onChange={handleChange} required className={styles.selectInput} >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    {/* Add other relevant statuses if needed */}
                </select>
            </div>
       </div>

      <div className={styles.formActions}>
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
          {isEditing ? 'Update Record' : 'Save Record'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default OutstandingForm;