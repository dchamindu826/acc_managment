// src/pages/Payments/PaymentForm.jsx
import React, { useState, useEffect } from 'react';
import InputField from '../../components/InputField/InputField.jsx';
import Button from '../../components/Button/Button.jsx';
import styles from './PaymentForm.module.css'; // We will create this CSS file next

const PaymentForm = ({ onSubmit, onCancel, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    date: '',
    reason: '',
    forWhom: '',
    amount: '',
  });

  const isEditing = Boolean(initialData); // Check if we are editing or adding

  // If initialData exists (editing), populate the form
  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date ? initialData.date.substring(0, 10) : '', // Format for date input 'YYYY-MM-DD'
        reason: initialData.reason || '',
        forWhom: initialData.forWhom || '',
        amount: initialData.amount || '',
      });
    } else {
      // Reset form if switching from edit to add
       setFormData({ date: '', reason: '', forWhom: '', amount: '' });
    }
  }, [initialData]); // Run effect when initialData changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation example (can be expanded)
    if (!formData.date || !formData.reason || !formData.forWhom || !formData.amount) {
        alert("Please fill in all fields.");
        return;
    }
    // Convert amount to number before submitting
    onSubmit({ ...formData, amount: parseFloat(formData.amount) });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.paymentForm}>
      <InputField
        label="Date"
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        required
      />
      <InputField
        label="Reason"
        type="text"
        name="reason"
        value={formData.reason}
        onChange={handleChange}
        placeholder="e.g., Office Supplies"
        required
      />
      <InputField
        label="For Whom / Paid To"
        type="text"
        name="forWhom"
        value={formData.forWhom}
        onChange={handleChange}
        placeholder="e.g., Stationery Shop"
        required
      />
      <InputField
        label="Amount"
        type="number"
        name="amount"
        value={formData.amount}
        onChange={handleChange}
        placeholder="e.g., 75.50"
        required
        step="0.01" // Allow decimals
      />

      {/* Action Buttons Wrapper */}
      <div className={styles.formActions}>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isEditing ? 'Update Payment' : 'Save Payment'}
        </Button>
        <Button
          type="button" // Important: type="button" to prevent form submission
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

export default PaymentForm;