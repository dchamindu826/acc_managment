// src/pages/Payments/PaymentVoucher.jsx
import React from 'react';
import { format, parseISO } from 'date-fns';

// Basic inline styles for printing/capturing - can be moved to CSS Module
const voucherStyles = {
  border: '1px solid #ccc',
  padding: '20px',
  width: '400px', // Adjust width as needed (e.g., for A5 size feel)
  fontFamily: 'Arial, sans-serif',
  fontSize: '12px',
  backgroundColor: '#fff', // Ensure background for capture
  color: '#000', // Ensure text color for capture
};

const headerStyles = {
  textAlign: 'center',
  marginBottom: '20px',
  borderBottom: '1px solid #eee',
  paddingBottom: '10px',
};

const detailRowStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
  padding: '4px 0',
  borderBottom: '1px dotted #eee',
};

const labelStyles = {
  fontWeight: 'bold',
};

const footerStyles = {
  marginTop: '30px',
  paddingTop: '10px',
  borderTop: '1px solid #eee',
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '10px',
  color: '#555',
};

// This component only defines the structure and content of the voucher
const PaymentVoucher = React.forwardRef(({ payment }, ref) => {
  if (!payment) return null;

  let formattedDate = 'N/A';
  try {
    formattedDate = format(parseISO(payment.date), 'PPP'); // Format: May 2nd, 2025
  } catch (e) {
    console.error("Error formatting date for voucher:", e);
  }

  const formattedAmount = `Rs. ${Number(payment.amount).toFixed(2)}`;

  return (
    // Forwarding ref to the main div for html2canvas capture
    <div ref={ref} style={voucherStyles}>
      <div style={headerStyles}>
        <h2 style={{ margin: '0 0 5px 0' }}>Payment Voucher</h2>
        {/* Add company name or logo here if needed */}
        {/* <p style={{ margin: 0 }}>Your Company Name</p> */}
        <p style={{ margin: '5px 0 0 0', fontSize: '10px' }}>Voucher ID: {payment.id}</p>
      </div>

      <div style={detailRowStyles}>
        <span style={labelStyles}>Date:</span>
        <span>{formattedDate}</span>
      </div>
      <div style={detailRowStyles}>
        <span style={labelStyles}>Reason / Description:</span>
        <span>{payment.reason}</span>
      </div>
      <div style={detailRowStyles}>
        <span style={labelStyles}>Paid To / For Whom:</span>
        <span>{payment.forWhom}</span>
      </div>
      <div style={{ ...detailRowStyles, borderBottom: 'none', marginTop: '10px' }}> {/* Last item style */}
        <span style={{ ...labelStyles, fontSize: '14px' }}>Amount Paid:</span>
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{formattedAmount}</span>
      </div>

      <div style={footerStyles}>
        <span>Generated: {format(new Date(), 'Pp')}</span>
        <span>Authorized Signature: ........................</span>
      </div>
    </div>
  );
});

PaymentVoucher.displayName = 'PaymentVoucher'; // Add display name for DevTools

export default PaymentVoucher;