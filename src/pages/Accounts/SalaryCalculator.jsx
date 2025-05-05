// src/pages/Accounts/SalaryCalculator.jsx
import React, { useState, useEffect, useMemo } from 'react';
import useMockApi from '../../hooks/useMockApi';
import { getEmployers } from '../../services/api';
import InputField from '../../components/InputField/InputField.jsx';
import Button from '../../components/Button/Button.jsx';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner.jsx';
import { generatePayslipPdf } from '../../utils/exportUtils.jsx';
import styles from './SalaryCalculator.module.css';
import { format } from 'date-fns';

const SalaryCalculator = () => {
  const { data: employers, isLoading: isLoadingEmployers, error: errorEmployers } = useMockApi(getEmployers, [], []);

  // --- State ---
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [editableBaseSalary, setEditableBaseSalary] = useState(''); // Start empty or 0
  const [editableOtRate, setEditableOtRate] = useState(''); // --> New State for OT Rate
  const [editableDailyRate, setEditableDailyRate] = useState(''); // --> New State for No Pay Daily Rate
  const [otHours, setOtHours] = useState(0);
  const [incentive, setIncentive] = useState(0);
  const [incentiveReason, setIncentiveReason] = useState('');
  const [deduction, setDeduction] = useState(0);
  const [deductionReason, setDeductionReason] = useState('');
  const [noPayDays, setNoPayDays] = useState(0);
  const [salaryAdvance, setSalaryAdvance] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Memoized Values ---
  const selectedEmployee = useMemo(() => {
    if (!selectedEmployeeId || !employers) return null;
    return employers.find(emp => emp.id === selectedEmployeeId);
  }, [selectedEmployeeId, employers]);

  // --- Effect to update editable fields when employee changes ---
  useEffect(() => {
    if (selectedEmployee) {
      const base = Number(selectedEmployee.salary) || 0;
      const otRate = Number(selectedEmployee.otRate) || 0;
      const defaultDailyRate = base > 0 ? (base / 30) : 0; // Calculate default daily rate

      setEditableBaseSalary(base);
      setEditableOtRate(otRate);
      setEditableDailyRate(defaultDailyRate.toFixed(2)); // Set default daily rate
    } else {
      // Reset all editable fields if no employee selected
      setEditableBaseSalary('');
      setEditableOtRate('');
      setEditableDailyRate('');
    }
    // Reset other calculation inputs as well
    setOtHours(0);
    setIncentive(0);
    setIncentiveReason('');
    setDeduction(0);
    setDeductionReason('');
    setNoPayDays(0);
    setSalaryAdvance(0);
  }, [selectedEmployee]); // Rerun when selectedEmployee object changes

  // --- Calculation Logic ---
  const calculation = useMemo(() => {
    const base = Number(editableBaseSalary) || 0;
    const otRate = Number(editableOtRate) || 0; // Use editable OT rate
    const dailyRate = Number(editableDailyRate) || 0; // Use editable Daily rate
    const ot = Number(otHours) || 0;
    const inc = Number(incentive) || 0;
    const ded = Number(deduction) || 0;
    const npDays = Number(noPayDays) || 0;
    const advance = Number(salaryAdvance) || 0;

    const noPayDeduction = dailyRate * npDays; // Calculate based on editable daily rate
    const otPay = ot * otRate; // Calculate based on editable OT rate
    const gross = base + otPay + inc;
    const totalDeductions = ded + noPayDeduction + advance;
    const net = gross - totalDeductions;

    return {
        base,
        otRate: otRate, // Pass the rate used
        otHours: ot,
        otPay,
        incentive: inc,
        incentiveReason: incentiveReason,
        gross,
        noPayDays: npDays,
        noPayDailyRate: dailyRate, // Pass the daily rate used
        noPayDeduction: noPayDeduction,
        salaryAdvance: advance,
        otherDeductions: ded,
        deductionReason: deductionReason,
        totalDeductions,
        net
    };

  }, [editableBaseSalary, editableOtRate, editableDailyRate, otHours, incentive, incentiveReason, deduction, deductionReason, noPayDays, salaryAdvance]); // Add all relevant states

  // --- Handlers ---
  const handleSelectChange = (e) => {
    setSelectedEmployeeId(e.target.value);
    // State updates are now handled by useEffect watching selectedEmployee
  };

  const handleGeneratePaysheet = async () => {
      if (!selectedEmployee) {
          alert("Please select an employee first.");
          return;
      }
      setIsGenerating(true);
      console.log("Generating Payslip for:", selectedEmployee.name);
      const currentMonth = format(new Date(2025, 4, 2), 'MMMM yyyy');

      try {
          // Pass selectedEmployee (for name/id/role) and calculation (for breakdown)
          await generatePayslipPdf(selectedEmployee, calculation, currentMonth);
      } catch (error) {
          console.error("Payslip generation failed in component:", error);
      } finally {
          setIsGenerating(false);
      }
  };

  const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

  return (
    <div className={styles.calculatorContainer}>
      {isLoadingEmployers && <LoadingSpinner />}
      {errorEmployers && <p className={styles.error}>Error loading employers: {errorEmployers}</p>}

      {!isLoadingEmployers && !errorEmployers && (
        <>
          <div className={styles.grid}>
            {/* Inputs Section */}
            <div className={styles.inputSection}>
              {/* Employee Selection */}
              <div className={styles.formField}>
                  <label htmlFor="employee-select" className={styles.label}>Select Employee</label>
                  <select id="employee-select" value={selectedEmployeeId} onChange={handleSelectChange} className={styles.selectInput} >
                      <option value="">-- Select Employee --</option>
                      {employers?.map(emp => ( <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option> ))}
                  </select>
              </div>

              {/* Salary and Rate Inputs */}
              <InputField label="Basic Salary (Rs.)" type="number" id="base-salary" value={editableBaseSalary} onChange={(e) => setEditableBaseSalary(e.target.value)} min="0" step="0.01" disabled={!selectedEmployeeId} />
              <InputField label="OT Rate (/hr)" type="number" id="ot-rate" value={editableOtRate} onChange={(e) => setEditableOtRate(e.target.value)} min="0" step="0.01" disabled={!selectedEmployeeId} /> {/* New Editable Field */}
              <InputField label="OT Hours" type="number" id="ot-hours" value={otHours} onChange={(e) => setOtHours(e.target.value)} min="0" disabled={!selectedEmployeeId} />
              <InputField label="Daily Rate for No Pay (Rs.)" type="number" id="daily-rate" value={editableDailyRate} onChange={(e) => setEditableDailyRate(e.target.value)} min="0" step="0.01" disabled={!selectedEmployeeId} /> {/* New Editable Field */}
              <InputField label="No Pay Days" type="number" id="no-pay" value={noPayDays} onChange={(e) => setNoPayDays(e.target.value)} min="0" disabled={!selectedEmployeeId} />

               {/* Incentive with Reason */}
               <div className={styles.inputGroupWithReason}>
                   <InputField label="Incentives (Rs.)" type="number" id="incentive" value={incentive} onChange={(e) => setIncentive(e.target.value)} min="0" step="0.01" disabled={!selectedEmployeeId}/>
                   <InputField label="Incentive Reason (Optional)" type="text" id="incentive-reason" value={incentiveReason} onChange={(e) => setIncentiveReason(e.target.value)} placeholder="e.g., Sales Bonus" disabled={!selectedEmployeeId || incentive <= 0}/>
               </div>

               {/* Advance and Deductions */}
               <InputField label="Salary Advance (Rs.)" type="number" id="advance" value={salaryAdvance} onChange={(e) => setSalaryAdvance(e.target.value)} min="0" step="0.01" disabled={!selectedEmployeeId} />
               <div className={styles.inputGroupWithReason}>
                   <InputField label="Other Deductions (Rs.)" type="number" id="deduction" value={deduction} onChange={(e) => setDeduction(e.target.value)} min="0" step="0.01" disabled={!selectedEmployeeId} />
                   <InputField label="Deduction Reason (Optional)" type="text" id="deduction-reason" value={deductionReason} onChange={(e) => setDeductionReason(e.target.value)} placeholder="e.g., Loan Repayment" disabled={!selectedEmployeeId || deduction <= 0}/>
               </div>

            </div>

            {/* Results Section */}
            <div className={styles.resultsSection}>
              <h3>Salary Breakdown</h3>
              {selectedEmployee ? (
                  <div className={styles.resultsGrid}>
                      {/* Earnings */}
                      <div className={styles.resultItem}><span className={styles.resultLabel}>Basic Salary:</span><span className={styles.resultValue}>{formatCurrency(calculation.base)}</span></div>
                      {/* Updated OT Pay display */}
                      <div className={styles.resultItem}><span className={styles.resultLabel}>OT Pay ({otHours} hrs @ {formatCurrency(calculation.otRate)}/hr):</span><span className={styles.resultValue}>{formatCurrency(calculation.otPay)}</span></div>
                      <div className={styles.resultItem}><span className={styles.resultLabel}>Incentives {calculation.incentiveReason ? `(${calculation.incentiveReason})` : ''}:</span><span className={styles.resultValue}>{formatCurrency(calculation.incentive)}</span></div>
                      <div className={`${styles.resultItem} ${styles.subTotal}`}><span className={styles.resultLabel}>Gross Salary:</span><span className={`${styles.resultValue} ${styles.highlight}`}>{formatCurrency(calculation.gross)}</span></div>
                      {/* Deductions */}
                      {/* Updated No Pay display */}
                      <div className={styles.resultItem}><span className={styles.resultLabel}>No Pay Deduction ({noPayDays} days @ {formatCurrency(calculation.noPayDailyRate)}/day):</span><span className={styles.resultValue}>(-) {formatCurrency(calculation.noPayDeduction)}</span></div>
                      <div className={styles.resultItem}><span className={styles.resultLabel}>Salary Advance:</span><span className={styles.resultValue}>(-) {formatCurrency(calculation.salaryAdvance)}</span></div>
                      <div className={styles.resultItem}><span className={styles.resultLabel}>Other Deductions {calculation.deductionReason ? `(${calculation.deductionReason})` : ''}:</span><span className={styles.resultValue}>(-) {formatCurrency(calculation.otherDeductions)}</span></div>
                      <div className={`${styles.resultItem} ${styles.subTotal}`}><span className={styles.resultLabel}>Total Deductions:</span><span className={`${styles.resultValue} ${styles.highlight}`}>{formatCurrency(calculation.totalDeductions)}</span></div>
                      {/* Net Pay */}
                      <div className={`${styles.resultItem} ${styles.netPayItem}`}><span className={styles.resultLabel}>Net Salary:</span><span className={`${styles.resultValue} ${styles.highlightNet}`}>{formatCurrency(calculation.net)}</span></div>
                  </div>
              ) : (
                  <p className={styles.placeholderText}>Select an employee to calculate salary.</p>
              )}
            </div>
          </div>
          {/* Generate Button Section */}
          {selectedEmployee && (
               <div className={styles.generateButtonContainer}>
                    <Button variant="primary" onClick={handleGeneratePaysheet} isLoading={isGenerating} disabled={isGenerating || !selectedEmployee} >
                        Generate Paysheet PDF
                    </Button>
               </div>
           )}
        </>
      )}
    </div>
  );
};

export default SalaryCalculator;