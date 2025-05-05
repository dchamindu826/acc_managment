// src/utils/exportUtils.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PaymentVoucher from '../pages/Payments/PaymentVoucher.jsx';
import Payslip from '../pages/Accounts/Payslip.jsx';
import * as XLSX from 'xlsx';
import { format, parseISO } from 'date-fns';

// --- Generate Voucher PDF ---
export const generateVoucherPdf = async (payment) => {
  const tempContainer = document.createElement('div');
  tempContainer.id = 'voucher-render-target';
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0px';
  tempContainer.style.zIndex = '-1';
  document.body.appendChild(tempContainer);
  const voucherRef = React.createRef();
  const root = createRoot(tempContainer);
  try {
    await new Promise((resolve) => {
        root.render(<PaymentVoucher payment={payment} ref={voucherRef} />);
        setTimeout(resolve, 50);
    });
    if (!voucherRef.current) throw new Error("Voucher component reference not found.");
    const canvas = await html2canvas(voucherRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const pdf = new jsPDF({ orientation: imgWidth > imgHeight ? 'l' : 'p', unit: 'px', format: [imgWidth, imgHeight], hotfixes: ["px_scaling"] });
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`payment-voucher-${payment.id || Date.now()}.pdf`);
    console.log("Voucher PDF generated successfully.");
    return true;
  } catch (error) {
    console.error("Error generating voucher PDF:", error);
    alert("Could not generate voucher PDF.");
    return false;
  } finally {
    if (root) root.unmount();
    if (tempContainer) document.body.removeChild(tempContainer);
  }
};

// --- Export Payments to Excel ---
export const exportPaymentsToExcel = (paymentsData, fileName = 'payments_export.xlsx') => {
  if (!paymentsData || paymentsData.length === 0) {
    alert("No data available to export.");
    return;
  }
  console.log(`Exporting ${paymentsData.length} payments to Excel...`);
  try {
    const dataForSheet = paymentsData.map(payment => ({
      'Date': payment.date ? format(parseISO(payment.date), 'yyyy-MM-dd') : 'N/A',
      'Reason': payment.reason,
      'Paid To / For Whom': payment.forWhom,
      'Amount (Rs.)': Number(payment.amount),
      'Voucher ID': payment.id
    }));
    const ws = XLSX.utils.json_to_sheet(dataForSheet);
    ws['!cols'] = [ { wch: 12 }, { wch: 35 }, { wch: 25 }, { wch: 15 }, { wch: 18 } ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, fileName);
    console.log("Payments Excel file generated successfully:", fileName);
  } catch (error) {
    console.error("Error generating Payments Excel file:", error);
    alert("Could not generate Payments Excel file.");
  }
};

// --- Generate Payslip PDF ---
export const generatePayslipPdf = async (employee, calculationData, period) => {
  const tempContainer = document.createElement('div');
  tempContainer.id = 'payslip-render-target';
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0px';
  tempContainer.style.zIndex = '-1';
  document.body.appendChild(tempContainer);
  const payslipRef = React.createRef();
  const root = createRoot(tempContainer);
  try {
    await new Promise((resolve) => {
        root.render(<Payslip employee={employee} calculation={calculationData} period={period} ref={payslipRef} />);
        setTimeout(resolve, 100);
    });
    if (!payslipRef.current) throw new Error("Payslip component reference not found.");
    const canvas = await html2canvas(payslipRef.current, { scale: 1.5, useCORS: true, backgroundColor: '#ffffff', logging: false, windowWidth: payslipRef.current.scrollWidth, windowHeight: payslipRef.current.scrollHeight });
    const imgData = canvas.toDataURL('image/png');
    const imgProps = { width: canvas.width, height: canvas.height };
    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min((pdfWidth * 0.9) / imgProps.width, (pdfHeight * 0.95) / imgProps.height);
    const imgFinalWidth = imgProps.width * ratio;
    const imgFinalHeight = imgProps.height * ratio;
    const xPos = (pdfWidth - imgFinalWidth) / 2;
    const yPos = (pdfHeight - imgFinalHeight) / 2;
    pdf.addImage(imgData, 'PNG', xPos, yPos, imgFinalWidth, imgFinalHeight);
    const fileName = `payslip-${employee.name?.replace(' ', '_') || employee.id}-${period?.replace(' ','_') || Date.now()}.pdf`;
    pdf.save(fileName);
    console.log("Payslip PDF generated successfully.");
    return true;
  } catch (error) {
    console.error("Error generating Payslip PDF:", error);
    alert("Could not generate Payslip PDF.");
    return false;
  } finally {
    if (root) root.unmount();
    if (tempContainer) document.body.removeChild(tempContainer);
  }
};

// --- Export Outstanding Data to Excel ---
export const exportOutstandingToExcel = (outstandingData, type = 'All', fileName = 'outstanding_export.xlsx') => {
  if (!outstandingData || outstandingData.length === 0) {
    alert("No data available to export.");
    return;
  }
  console.log(`Exporting ${outstandingData.length} outstanding records (${type}) to Excel...`);
  try {
    const dataForSheet = outstandingData.map(item => ({
      'Type': item.type === 'payable' ? 'Payable' : 'Receivable',
      'Name': item.name,
      'Description': item.description,
      'Amount (Rs.)': Number(item.amount),
      'Date': item.date ? format(parseISO(item.date), 'yyyy-MM-dd') : 'N/A',
      'Status': item.status,
      'Record ID': item.id
    }));
    const ws = XLSX.utils.json_to_sheet(dataForSheet);
    ws['!cols'] = [ { wch: 12 }, { wch: 25 }, { wch: 35 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 18 } ];
    const wb = XLSX.utils.book_new();
    const sheetName = type === 'payable' ? 'Payables' : (type === 'receivable' ? 'Receivables' : 'Outstanding');
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
    console.log("Outstanding Excel file generated successfully:", fileName);
  } catch (error) {
    console.error("Error generating Outstanding Excel file:", error);
    alert("Could not generate Outstanding Excel file.");
  }
};

// --- NEW Function to Export Gatepass Data to Excel ---
export const exportGatepassToExcel = (gatepassData, dateRange = {}, fileName = 'gatepass_export.xlsx') => {
  if (!gatepassData || gatepassData.length === 0) {
    alert("No gatepass data available to export for the selected range.");
    return;
  }

  console.log(`Exporting ${gatepassData.length} gatepass records to Excel...`);
  let rangeText = '';
  if (dateRange.start || dateRange.end) {
    const start = dateRange.start ? format(new Date(dateRange.start), 'yyyy-MM-dd') : 'Start';
    const end = dateRange.end ? format(new Date(dateRange.end), 'yyyy-MM-dd') : 'End';
    rangeText = ` From ${start} To ${end}`;
  }

  try {
    // 1. Prepare data
    const dataForSheet = gatepassData.map(item => ({
      'Receive Date': item.receiveDate ? format(parseISO(item.receiveDate), 'yyyy-MM-dd') : 'N/A',
      'Send Date': item.sendDate ? format(parseISO(item.sendDate), 'yyyy-MM-dd') : 'N/A',
      'Category': item.category,
      'Invoice No': item.invoiceNumber,
      'Quantity': item.quantity,
      'Remarks': item.remarks,
      'Special Note': item.specialNote,
      'Note Date': item.noteDate ? format(parseISO(item.noteDate), 'yyyy-MM-dd') : 'N/A',
      'Record ID': item.id
    }));

    // 2. Create worksheet
    const ws = XLSX.utils.json_to_sheet(dataForSheet);

    // 3. Set column widths (optional)
    ws['!cols'] = [ { wch: 12 }, { wch: 12 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 40 }, { wch: 40 }, { wch: 12 }, { wch: 18 } ];

    // 4. Create workbook and append sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Gatepasses${rangeText}`);

    // 5. Generate and download
    XLSX.writeFile(wb, fileName);
    console.log("Gatepass Excel file generated successfully:", fileName);

  } catch (error) {
    console.error("Error generating Gatepass Excel file:", error);
    alert("Could not generate Gatepass Excel file.");
  }
};