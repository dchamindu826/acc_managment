// src/pages/Employers/EmployerForm.jsx
import React, { useState, useEffect } from 'react';
import InputField from '../../components/InputField/InputField.jsx';
import Button from '../../components/Button/Button.jsx';
import styles from './EmployerForm.module.css'; // Create this CSS file next

const EmployerForm = ({ onSubmit, onCancel, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '', role: '', department: '', salary: '', otRate: '',
    address: '', birthday: '', email: '', contactNumber: '', nic: '', bankAccount: ''
  });

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        role: initialData.role || '',
        department: initialData.department || '',
        salary: initialData.salary || '',
        otRate: initialData.otRate || '',
        address: initialData.address || '',
        birthday: initialData.birthday ? initialData.birthday.substring(0, 10) : '',
        email: initialData.email || '',
        contactNumber: initialData.contactNumber || '',
        nic: initialData.nic || '',
        bankAccount: initialData.bankAccount || '',
      });
    } else {
      // Reset form for adding
      setFormData({
        name: '', role: '', department: '', salary: '', otRate: '',
        address: '', birthday: '', email: '', contactNumber: '', nic: '', bankAccount: ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      // Handle textarea separately if needed, otherwise InputField handles it
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add more specific validation if needed
    if (!formData.name || !formData.role || !formData.salary) {
        alert("Please fill in at least Name, Role, and Salary.");
        return;
    }
    // Pass numbers as numbers
    onSubmit({
        ...formData,
        salary: parseFloat(formData.salary) || 0,
        otRate: parseFloat(formData.otRate) || 0
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.employerForm}>
      <div className={styles.formGrid}> {/* Use grid for layout */}
        <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
        <InputField label="Role / Position" name="role" value={formData.role} onChange={handleChange} required />
        <InputField label="Department" name="department" value={formData.department} onChange={handleChange} />
        <InputField label="Basic Salary (Rs.)" name="salary" type="number" step="0.01" value={formData.salary} onChange={handleChange} required />
        <InputField label="OT Rate (/hr)" name="otRate" type="number" step="0.01" value={formData.otRate} onChange={handleChange} />
        <InputField label="NIC / ID No." name="nic" value={formData.nic} onChange={handleChange} />
        <InputField label="Date of Birth" name="birthday" type="date" value={formData.birthday} onChange={handleChange} />
        <InputField label="Contact Number" name="contactNumber" type="tel" value={formData.contactNumber} onChange={handleChange} />
        <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
        <InputField label="Bank Account Details" name="bankAccount" value={formData.bankAccount} onChange={handleChange} />
        {/* Address uses textarea - handled by InputField type="text" or could make a dedicated component */}
        <InputField label="Address" name="address" value={formData.address} onChange={handleChange} className={styles.addressField} />
      </div>

      <div className={styles.formActions}>
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
          {isEditing ? 'Update Employer' : 'Save Employer'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EmployerForm;