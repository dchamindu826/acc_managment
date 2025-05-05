// src/pages/Chemicals/ChemicalPurchaseForm.jsx
import React, { useState, useEffect } from 'react';
import InputField from '../../components/InputField/InputField.jsx';
import Button from '../../components/Button/Button.jsx';
import styles from './ChemicalPurchaseForm.module.css'; // Create this CSS file next

const ChemicalPurchaseForm = ({ onSubmit, onCancel, chemicalName, chemicalUnit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    quantity: '',
    supplier: '', // Optional field
    cost: '', // Optional field
    purchaseDate: new Date().toISOString().substring(0, 10), // Default to today
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const quantityValue = parseFloat(formData.quantity);
    if (isNaN(quantityValue) || quantityValue <= 0) {
      alert("Please enter a valid positive quantity purchased.");
      return;
    }
    // Pass relevant data back
    onSubmit({
        quantity: quantityValue,
        supplier: formData.supplier,
        cost: parseFloat(formData.cost) || 0, // Ensure cost is a number
        purchaseDate: formData.purchaseDate
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.purchaseForm}>
      {/* Display chemical name and unit for clarity */}
      <p className={styles.chemicalInfo}>
        Adding purchase for: <strong>{chemicalName || 'N/A'}</strong> (Unit: {chemicalUnit || 'N/A'})
      </p>

      <InputField
        label={`Quantity Purchased (${chemicalUnit || 'Unit'})`}
        type="number"
        name="quantity"
        id="purchase-quantity"
        value={formData.quantity}
        onChange={handleChange}
        placeholder="e.g., 10"
        required
        step="any" // Allow decimals if needed for units like L/kg
        min="0.0001" // Ensure positive value
      />
      <InputField
        label="Supplier (Optional)"
        type="text"
        name="supplier"
        id="purchase-supplier"
        value={formData.supplier}
        onChange={handleChange}
        placeholder="e.g., Chemical Supplies Ltd."
      />
       <InputField
        label="Total Cost (Optional, Rs.)"
        type="number"
        name="cost"
        id="purchase-cost"
        value={formData.cost}
        onChange={handleChange}
        placeholder="e.g., 5000.00"
        step="0.01"
        min="0"
      />
       <InputField
        label="Purchase Date (Optional)"
        type="date"
        name="purchaseDate"
        id="purchase-date"
        value={formData.purchaseDate}
        onChange={handleChange}
      />


      <div className={styles.formActions}>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Add Purchase to Stock
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

export default ChemicalPurchaseForm;