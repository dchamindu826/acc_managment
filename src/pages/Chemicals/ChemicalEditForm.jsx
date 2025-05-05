// src/pages/Chemicals/ChemicalEditForm.jsx
import React, { useState, useEffect } from 'react';
import InputField from '../../components/InputField/InputField.jsx';
import Button from '../../components/Button/Button.jsx';
import styles from './ChemicalEditForm.module.css'; // Create this CSS file next

const ChemicalEditForm = ({ onSubmit, onCancel, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
  });

  const isEditing = Boolean(initialData); // Should always be true here, but good practice

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        unit: initialData.unit || '',
      });
    }
    // No 'else' needed as this form is only for editing existing chemicals
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.unit) {
      alert("Please fill in both Chemical Name and Unit.");
      return;
    }
    // Pass back only the fields that can be edited
    onSubmit({
        name: formData.name,
        unit: formData.unit
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.editForm}>
      {/* Display chemical ID for reference if needed */}
      {initialData?.id && <p className={styles.chemicalInfo}>Editing Chemical ID: {initialData.id}</p>}

      <InputField
        label="Chemical Name"
        type="text"
        name="name"
        id="chemical-name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g., Hydrochloric Acid (HCl)"
        required
      />
      <InputField
        label="Unit"
        type="text"
        name="unit"
        id="chemical-unit"
        value={formData.unit}
        onChange={handleChange}
        placeholder="e.g., L, kg, pcs, bottle"
        required
      />

      <div className={styles.formActions}>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Update Chemical
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

export default ChemicalEditForm;