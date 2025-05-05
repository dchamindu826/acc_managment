// src/pages/Accounts/Payslip.jsx
import React from 'react';
import styles from './Payslip.module.css';

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const Payslip = React.forwardRef(({ employee, calculation, period }, ref) => {
  if (!employee || !calculation) return null;

  const earnings = [
    { label: 'Base Salary', value: calculation.base },
     // Show OT Rate used in calculation
    { label: `OT Pay (${calculation.otHours || 0} hrs @ ${formatCurrency(calculation.otRate)}/hr)`, value: calculation.otPay },
    { label: `Incentives ${calculation.incentiveReason ? `(${calculation.incentiveReason})` : ''}`, value: calculation.incentive },
  ];

  const deductions = [
     // Show Daily Rate used in calculation
    { label: `No Pay (${calculation.noPayDays || 0} days @ ${formatCurrency(calculation.noPayDailyRate)}/day)`, value: calculation.noPayDeduction },
    { label: 'Salary Advance', value: calculation.salaryAdvance },
    { label: `Other Deductions ${calculation.deductionReason ? `(${calculation.deductionReason})` : ''}`, value: calculation.otherDeductions },
  ];

  return (
    <div ref={ref} className={styles.payslipContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.companyInfo}>
          <h2>Your Company Name</h2>
        </div>
        <h3 className={styles.title}>PAYSLIP</h3>
        <div className={styles.periodInfo}>
          <p><strong>Pay Period:</strong> {period || 'N/A'}</p>
        </div>
      </div>

      {/* Employee Info */}
      <div className={styles.employeeInfo}>
        <div><strong>Employee Name:</strong> {employee.name}</div>
        <div><strong>Employee ID:</strong> {employee.id}</div>
        <div><strong>Role:</strong> {employee.role}</div>
      </div>

      {/* Earnings & Deductions Table */}
      <div className={styles.detailsGrid}>
        {/* Earnings Column */}
        <div className={styles.column}>
          <h4>Earnings</h4>
          <table>
            <tbody>
              {earnings.map((item, index) => (
                <tr key={`earn-${index}`}>
                  <td>{item.label}</td>
                  <td className={styles.amount}>{formatCurrency(item.value)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
               <tr className={styles.totalRow}>
                  <td><strong>Gross Salary</strong></td>
                  <td className={styles.amount}><strong>{formatCurrency(calculation.gross)}</strong></td>
                </tr>
            </tfoot>
          </table>
        </div>

        {/* Deductions Column */}
        <div className={styles.column}>
          <h4>Deductions</h4>
          <table>
            <tbody>
               {deductions.map((item, index) => (
                 <tr key={`ded-${index}`}>
                   <td>{item.label}</td>
                   <td className={styles.amount}>(-) {formatCurrency(item.value)}</td>
                 </tr>
               ))}
            </tbody>
             <tfoot>
               <tr className={styles.totalRow}>
                  <td><strong>Total Deductions</strong></td>
                  <td className={styles.amount}><strong>(-) {formatCurrency(calculation.totalDeductions)}</strong></td>
                </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Net Pay Summary */}
      <div className={styles.netPaySummary}>
        <div className={styles.netPayLabel}>NET PAY</div>
        <div className={styles.netPayValue}>{formatCurrency(calculation.net)}</div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>This is a computer-generated document.</p>
      </div>
    </div>
  );
});

Payslip.displayName = 'Payslip';

export default Payslip;