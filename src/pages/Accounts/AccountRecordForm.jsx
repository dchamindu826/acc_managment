// src/pages/Accounts/AccountRecordForm.jsx
import React, { useState, useEffect } from 'react';
import InputField from '../../components/InputField/InputField.jsx';
import Button from '../../components/Button/Button.jsx';
import styles from './AccountRecordForm.module.css'; // Create this CSS file next

const AccountRecordForm = ({ onSubmit, onCancel, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    type: 'debit', // Default to debit
    date: '',
    description: '',
    amount: '',
  });

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'debit',
        date: initialData.date ? initialData.date.substring(0, 10) : '',
        description: initialData.description || '',
        amount: initialData.amount || '',
      });
    } else {
      // Reset form for adding new record
      setFormData({
        type: 'debit',
        date: new Date().toISOString().substring(0, 10), // Default to today
        description: '',
        amount: '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date || !formData.description || !formData.amount) {
      alert("Please fill in Date, Description, and Amount.");
      return;
    }
    onSubmit({ ...formData, amount: parseFloat(formData.amount) });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.accountForm}>
      <div className={styles.formRow}>
        <div className={styles.formField}>
            <label htmlFor="record-type" className={styles.label}>Type</label>
            <select
                id="record-type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={styles.selectInput} // Style similarly to InputField
                required
            >
                <option value="debit">Debit (Expense)</option>
                <option value="credit">Credit (Income)</option>
            </select>
        </div>
        <div className={styles.formField}>
            <InputField
                label="Date"
                type="date"
                name="date"
                id="record-date"
                value={formData.date}
                onChange={handleChange}
                required
            />
        </div>
      </div>

      <InputField
        label="Description"
        type="text"
        name="description"
        id="record-description"
        value={formData.description}
        onChange={handleChange}
        placeholder="e.g., Salary Payment, Client Receipt"
        required
      />
      <InputField
        label="Amount"
        type="number"
        name="amount"
        id="record-amount"
        value={formData.amount}
        onChange={handleChange}
        placeholder="e.g., 5000.00"
        required
        step="0.01"
      />

      <div className={styles.formActions}>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isEditing ? 'Update Record' : 'Save Record'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AccountRecordForm;