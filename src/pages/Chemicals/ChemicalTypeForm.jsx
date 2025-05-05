// src/pages/Chemicals/ChemicalTypeForm.jsx
import React, { useState } from 'react';
import InputField from '../../components/InputField/InputField.jsx';
import Button from '../../components/Button/Button.jsx';
import styles from './ChemicalTypeForm.module.css'; // Create this CSS file next

const ChemicalTypeForm = ({ onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    initialQuantity: '0', // Keep as string for input, convert on submit
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.unit) {
      alert("Please fill in Chemical Name and Unit.");
      return;
    }
    onSubmit({
      name: formData.name,
      unit: formData.unit,
      // Convert initial quantity to number, default to 0 if empty or invalid
      initialQuantity: parseFloat(formData.initialQuantity) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.typeForm}>
      <InputField
        label="New Chemical Name"
        type="text"
        name="name"
        id="new-chemical-name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g., Sulfuric Acid (H₂SO₄)"
        required
      />
      <InputField
        label="Measurement Unit"
        type="text"
        name="unit"
        id="new-chemical-unit"
        value={formData.unit}
        onChange={handleChange}
        placeholder="e.g., L, kg, bottle"
        required
      />
      <InputField
        label="Initial Stock Quantity (Optional)"
        type="number"
        name="initialQuantity"
        id="new-chemical-quantity"
        value={formData.initialQuantity}
        onChange={handleChange}
        placeholder="e.g., 10"
        min="0"
        step="any" // Allow decimals
      />

      <div className={styles.formActions}>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Add Chemical Type
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

export default ChemicalTypeForm;