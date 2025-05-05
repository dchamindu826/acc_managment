// src/pages/Outstanding/OutstandingUpdateForm.jsx
import React, { useState, useEffect } from 'react';
import InputField from '../../components/InputField/InputField.jsx';
import Button from '../../components/Button/Button.jsx';
import styles from './OutstandingUpdateForm.module.css'; // Create this CSS file next

const OutstandingUpdateForm = ({ onSubmit, onCancel, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    amount: '',
    status: 'Pending', // Default status
    // Add other fields like 'date' if needed
  });

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount || '',
        status: initialData.status || 'Pending',
        // date: initialData.date ? initialData.date.substring(0, 10) : '',
      });
    }
    // No 'else' needed as this form is only for editing
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountValue = parseFloat(formData.amount);
    if (isNaN(amountValue) || amountValue < 0) {
      alert("Please enter a valid non-negative amount.");
      return;
    }
    if (!formData.status) {
        alert("Please select a status.");
        return;
    }
    // Pass back only the fields that can be edited
    onSubmit({
        amount: amountValue,
        status: formData.status,
        // date: formData.date // Include if date is editable
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.updateForm}>
      {initialData?.id && <p className={styles.recordInfo}>Updating Record for: <strong>{initialData.name}</strong> (ID: {initialData.id})</p>}

      <InputField
        label="Outstanding Amount (Rs.)"
        type="number"
        name="amount"
        id="outstanding-amount"
        value={formData.amount}
        onChange={handleChange}
        required
        step="0.01"
        min="0"
      />

      <div className={styles.formField}> {/* Wrapper for select */}
          <label htmlFor="outstanding-status" className={styles.label}>Status</label>
          <select
              id="outstanding-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={styles.selectInput} // Reuse style from other forms
              required
          >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              {/* Add other relevant statuses if needed */}
          </select>
      </div>

      {/* Add Date field if needed */}
      {/* <InputField label="Date" type="date" name="date" value={formData.date} onChange={handleChange} /> */}


      <div className={styles.formActions}>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Update Record
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

export default OutstandingUpdateForm;