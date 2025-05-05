// src/pages/Chemicals/ChemicalUsageForm.jsx
import React, { useState } from 'react';
import InputField from '../../components/InputField/InputField.jsx';
import Button from '../../components/Button/Button.jsx';
import styles from './ChemicalUsageForm.module.css'; // Create this CSS file next

const ChemicalUsageForm = ({ onSubmit, onCancel, chemicalName, chemicalUnit, currentStock, isLoading = false }) => {
  const [formData, setFormData] = useState({
    quantityUsed: '',
    reason: '', // Optional field
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const quantityValue = parseFloat(formData.quantityUsed);

    if (isNaN(quantityValue) || quantityValue <= 0) {
      alert("Please enter a valid positive quantity used.");
      return;
    }
    if (quantityValue > currentStock) {
       alert(`Cannot use more than the available stock (${currentStock} ${chemicalUnit || 'Unit'}).`);
       return;
    }

    onSubmit({
        quantityUsed: quantityValue,
        reason: formData.reason,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.usageForm}>
      <p className={styles.chemicalInfo}>
        Record usage for: <strong>{chemicalName || 'N/A'}</strong><br/>
        Available Stock: {currentStock ?? 'N/A'} {chemicalUnit || 'N/A'}
      </p>

      <InputField
        label={`Quantity Used (${chemicalUnit || 'Unit'})`}
        type="number"
        name="quantityUsed"
        id="usage-quantity"
        value={formData.quantityUsed}
        onChange={handleChange}
        placeholder="e.g., 5.5"
        required
        step="any"
        min="0.0001"
        max={currentStock} // HTML5 max validation
      />
      <InputField
        label="Reason / Purpose (Optional)"
        type="text"
        name="reason"
        id="usage-reason"
        value={formData.reason}
        onChange={handleChange}
        placeholder="e.g., For Production Batch XYZ"
      />

      <div className={styles.formActions}>
        <Button
          type="submit"
          variant="primary" // Or maybe 'danger' variant?
          isLoading={isLoading}
          disabled={isLoading}
        >
          Record Usage
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

export default ChemicalUsageForm;