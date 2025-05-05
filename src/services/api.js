// src/services/api.js
import axios from 'axios'; // Import axios
// Import mock data needed for OTHER sections
import { employers, chemicals, outstanding, accountRecords, gatepasses, notes } from './mockData';
// Import date-fns functions used across the file
import { formatISO, subDays, startOfDay, parseISO } from 'date-fns';

// --- Base API URL ---
// Ensure this matches the port your backend server is running on
const API_URL = 'http://localhost:5000/api/v1'; // Your backend URL

// Delay function for simulating network latency (for MOCK functions)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate API call helper function (for MOCK functions)
const simulateApiCall = async (data, ms = 300) => {
  await delay(ms);
  // if (Math.random() > 0.95) throw new Error("Simulated Network Error!");
  return JSON.parse(JSON.stringify(data));
};

// --- Payments API (Using Real Backend) ---

export const getPayments = async () => {
  console.log('API Call: getPayments (Real)');
  try {
    const response = await axios.get(`${API_URL}/payments`);
    if (response.data && response.data.success) {
      // Map backend fields to frontend fields if needed
      return response.data.data.map(p => ({ ...p, date: p.payment_date, forWhom: p.paid_to }));
    } else {
      throw new Error(response.data?.error || 'Failed to fetch payments');
    }
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw new Error(error.response?.data?.error || error.message || 'Network error or server is down');
  }
};

export const addPayment = async (paymentData) => {
  console.log('API Call: addPayment (Real)', paymentData);
  try {
    // Map frontend field names to backend field names
    const dataToSend = {
        payment_date: paymentData.date, // Map date to payment_date
        reason: paymentData.reason,
        paid_to: paymentData.forWhom, // Map forWhom to paid_to
        amount: Number(paymentData.amount) || 0
    };
    const response = await axios.post(`${API_URL}/payments`, dataToSend);
    if (response.data && response.data.success) {
       // Map backend response back to frontend fields if necessary
       const savedData = response.data.data;
       return { ...savedData, date: savedData.payment_date, forWhom: savedData.paid_to };
    } else {
      throw new Error(response.data?.error || 'Failed to add payment');
    }
  } catch (error) {
    console.error("Error adding payment:", error);
    const errorMsg = Array.isArray(error.response?.data?.error) ? error.response.data.error.join(', ') : error.response?.data?.error;
    throw new Error(errorMsg || error.message || 'Network error or server is down');
  }
};

export const updatePayment = async (id, updatedData) => {
  console.log(`API Call: updatePayment (Real) ID: ${id}`, updatedData);
  try {
     // Map frontend field names to backend field names for update
     const dataToSend = {
        payment_date: updatedData.date,
        reason: updatedData.reason,
        paid_to: updatedData.forWhom,
        amount: updatedData.amount !== undefined ? Number(updatedData.amount) : undefined
     };
     // Remove undefined fields so only provided fields are sent
     Object.keys(dataToSend).forEach(key => dataToSend[key] === undefined && delete dataToSend[key]);

    const response = await axios.put(`${API_URL}/payments/${id}`, dataToSend);
    if (response.data && response.data.success) {
      // Map backend response back to frontend fields if necessary
      const savedData = response.data.data;
      return { ...savedData, date: savedData.payment_date, forWhom: savedData.paid_to };
    } else {
      throw new Error(response.data?.error || 'Failed to update payment');
    }
  } catch (error) {
    console.error("Error updating payment:", error);
    const errorMsg = Array.isArray(error.response?.data?.error) ? error.response.data.error.join(', ') : error.response?.data?.error;
     if (error.response?.status === 404) {
         throw new Error('Payment not found on server.');
     }
    throw new Error(errorMsg || error.message || 'Network error or server is down');
  }
};

export const deletePayment = async (id) => {
  console.log(`API Call: deletePayment (Real) ID: ${id}`);
  try {
    const response = await axios.delete(`${API_URL}/payments/${id}`);
    // Check for successful status codes (200 or 204)
    if (response.status === 200 || response.status === 204) {
        if (response.data && response.data.success) {
            return response.data.data; // Return empty object {} or whatever backend sends
        } else {
             // Handle cases where success might be false or data structure is unexpected
             // Treat 200/204 without success:true as success for delete generally
            return {};
        }
    } else {
        // If status is not 200/204, treat as error
      throw new Error(response.data?.error || `Failed to delete payment with status ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting payment:", error);
    if (error.response?.status === 404) {
         throw new Error('Payment not found on server.');
     }
    throw new Error(error.response?.data?.error || error.message || 'Network error or server is down');
  }
};


// --- Employers API (Mock) ---
export const getEmployers = async () => simulateApiCall(employers);
export const addEmployer = async (employerData) => {
    await delay(300);
    const newEmployer = { ...employerData, id: `e${Date.now()}`, salary: Number(employerData.salary) || 0, otRate: Number(employerData.otRate) || 0 };
    employers.push(newEmployer);
    console.log("Mock API: Added Employer:", newEmployer);
    return simulateApiCall(newEmployer);
};
export const updateEmployer = async (id, updatedData) => {
    await delay(300);
    const index = employers.findIndex(e => e.id === id);
    if (index === -1) throw new Error("Employer not found");
    employers[index] = { ...employers[index], ...updatedData, salary: updatedData.salary !== undefined ? Number(updatedData.salary) || 0 : employers[index].salary, otRate: updatedData.otRate !== undefined ? Number(updatedData.otRate) || 0 : employers[index].otRate, };
    console.log("Mock API: Updated Employer:", employers[index]);
    return simulateApiCall(employers[index]);
};
export const deleteEmployer = async (id) => {
    await delay(400);
    const index = employers.findIndex(e => e.id === id);
    if (index === -1) throw new Error("Employer not found");
    employers.splice(index, 1);
    console.log("Mock API: Deleted Employer ID:", id);
    return simulateApiCall({ success: true });
};

// --- Chemicals API (Mock) ---
export const getChemicals = async () => simulateApiCall(chemicals);
export const addChemicalPurchase = async (purchaseData) => {
    await delay(300);
    const { chemicalId, quantity, ...rest } = purchaseData;
    const index = chemicals.findIndex(c => c.id === chemicalId);
    if (index === -1) throw new Error("Chemical not found to add purchase to");
    chemicals[index].quantity = (Number(chemicals[index].quantity) || 0) + (Number(quantity) || 0);
    chemicals[index].lastUpdated = formatISO(new Date());
    if (!chemicals[index].purchaseHistory) chemicals[index].purchaseHistory = [];
     chemicals[index].purchaseHistory.push({ date: formatISO(new Date()), quantity: Number(quantity) || 0, ...rest });
    console.log("Mock API: Added Chemical Purchase:", chemicalId, quantity);
    return simulateApiCall(chemicals[index]);
};
export const updateChemical = async (id, updatedData) => {
    await delay(300);
    const index = chemicals.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Chemical not found");
    chemicals[index] = { ...chemicals[index], name: updatedData.name || chemicals[index].name, unit: updatedData.unit || chemicals[index].unit, lastUpdated: formatISO(new Date()) };
    console.log("Mock API: Updated Chemical Details:", chemicals[index]);
    return simulateApiCall(chemicals[index]);
};
export const recordChemicalUsage = async (chemicalId, usageData) => {
    await delay(300);
    const index = chemicals.findIndex(c => c.id === chemicalId);
    if (index === -1) throw new Error("Chemical not found to record usage for");
    const quantityUsed = Number(usageData.quantityUsed) || 0;
    if (quantityUsed <= 0) throw new Error("Quantity used must be a positive number.");
    const currentQuantity = Number(chemicals[index].quantity) || 0;
    if (quantityUsed > currentQuantity) throw new Error(`Cannot use ${quantityUsed} ${chemicals[index].unit || ''}. Only ${currentQuantity} ${chemicals[index].unit || ''} available.`);
    chemicals[index].quantity = currentQuantity - quantityUsed;
    chemicals[index].lastUpdated = formatISO(new Date());
    console.log("Mock API: Recorded Usage:", { id: chemicalId, quantityUsed, reason: usageData.reason, newQuantity: chemicals[index].quantity });
    return simulateApiCall(chemicals[index]);
};
export const addChemicalType = async (newChemicalData) => {
    await delay(300);
    if (!newChemicalData.name || !newChemicalData.unit) throw new Error("Chemical Name and Unit are required.");
    const nameExists = chemicals.some(chem => chem.name.toLowerCase() === newChemicalData.name.toLowerCase());
    if (nameExists) throw new Error(`Chemical with name "${newChemicalData.name}" already exists.`);
    const newChemical = { id: `c${Date.now()}`, name: newChemicalData.name, unit: newChemicalData.unit, quantity: Number(newChemicalData.initialQuantity) || 0, lastUpdated: formatISO(new Date()), purchaseHistory: [], usageHistory: [] };
    chemicals.push(newChemical);
    console.log("Mock API: Added New Chemical Type:", newChemical);
    return simulateApiCall(newChemical);
};

// --- Outstanding API (Mock) ---
export const getOutstanding = async () => simulateApiCall(outstanding);
export const addOutstanding = async (outstandingData) => {
    await delay(300);
    if (!outstandingData.type || !outstandingData.name || outstandingData.amount === undefined) throw new Error("Type, Name, and Amount are required.");
    const newRecord = { id: `o${Date.now()}`, type: outstandingData.type, name: outstandingData.name, description: outstandingData.description || '', amount: Number(outstandingData.amount) || 0, date: outstandingData.date ? formatISO(new Date(outstandingData.date)) : formatISO(new Date()), status: outstandingData.status || 'Pending' };
    outstanding.push(newRecord);
    console.log("Mock API: Added Outstanding Record:", newRecord);
    return simulateApiCall(newRecord);
};
export const updateOutstanding = async (id, updatedData) => {
    await delay(300);
    const index = outstanding.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Outstanding record not found");
    outstanding[index] = { ...outstanding[index], ...updatedData, amount: updatedData.amount !== undefined ? Number(updatedData.amount) || 0 : outstanding[index].amount, date: updatedData.date ? formatISO(new Date(updatedData.date)) : outstanding[index].date };
    console.log("Mock API: Updated Outstanding:", outstanding[index]);
    return simulateApiCall(outstanding[index]);
};
export const deleteOutstanding = async (id) => {
    await delay(400);
    const index = outstanding.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Outstanding record not found");
    const deletedRecord = outstanding.splice(index, 1);
    console.log("Mock API: Deleted Outstanding ID:", id);
    return simulateApiCall({ success: true, deleted: deletedRecord[0] });
};

// --- Gatepass API (Mock) ---
export const getGatepasses = async () => simulateApiCall(gatepasses);
export const addGatepass = async (gatepassData) => {
    await delay(300);
    if (!gatepassData.receiveDate || !gatepassData.category) throw new Error("Receive Date and Category are required.");
    const newGatepass = { id: `gp${Date.now()}`, receiveDate: gatepassData.receiveDate ? formatISO(new Date(gatepassData.receiveDate)) : formatISO(new Date()), sendDate: gatepassData.sendDate ? formatISO(new Date(gatepassData.sendDate)) : null, category: gatepassData.category, invoiceNumber: gatepassData.invoiceNumber || '', remarks: gatepassData.remarks || '', quantity: gatepassData.quantity || '', specialNote: gatepassData.specialNote || '', noteDate: gatepassData.noteDate ? formatISO(new Date(gatepassData.noteDate)) : null };
    gatepasses.push(newGatepass);
    console.log("Mock API: Added Gatepass:", newGatepass);
    return simulateApiCall(newGatepass);
};
export const updateGatepass = async (id, updatedData) => {
    await delay(300);
    const index = gatepasses.findIndex(gp => gp.id === id);
    if (index === -1) throw new Error("Gatepass record not found");
    const receiveDate = updatedData.receiveDate ? formatISO(new Date(updatedData.receiveDate)) : gatepasses[index].receiveDate;
    const sendDate = updatedData.sendDate ? formatISO(new Date(updatedData.sendDate)) : (updatedData.sendDate === '' ? null : gatepasses[index].sendDate);
    const noteDate = updatedData.noteDate ? formatISO(new Date(updatedData.noteDate)) : (updatedData.noteDate === '' ? null : gatepasses[index].noteDate);
    gatepasses[index] = { ...gatepasses[index], ...updatedData, receiveDate, sendDate, noteDate };
    console.log("Mock API: Updated Gatepass:", gatepasses[index]);
    return simulateApiCall(gatepasses[index]);
};
export const deleteGatepass = async (id) => {
    await delay(400);
    const index = gatepasses.findIndex(gp => gp.id === id);
    if (index === -1) throw new Error("Gatepass record not found");
    const deletedGatepass = gatepasses.splice(index, 1);
    console.log("Mock API: Deleted Gatepass ID:", id);
    return simulateApiCall({ success: true, deleted: deletedGatepass[0] });
};

// --- Notes API (Mock) ---
export const getNotes = async () => simulateApiCall(notes);
export const addNote = async (noteData) => {
    await delay(300);
    if (!noteData.content || !noteData.targetDateTime) throw new Error("Note content and target date/time are required.");
    const newNote = { id: `n${Date.now()}`, content: noteData.content, targetDateTime: formatISO(new Date(noteData.targetDateTime)), status: 'Pending' };
    notes.push(newNote);
    console.log("Mock API: Added Note:", newNote);
    return simulateApiCall(newNote);
};
export const updateNote = async (id, updatedData) => {
    await delay(300);
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) throw new Error("Note not found");
    notes[index] = { ...notes[index], ...updatedData, targetDateTime: updatedData.targetDateTime ? formatISO(new Date(updatedData.targetDateTime)) : notes[index].targetDateTime, status: updatedData.status || notes[index].status };
    console.log("Mock API: Updated Note:", notes[index]);
    return simulateApiCall(notes[index]);
};
export const deleteNote = async (id) => {
    await delay(400);
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) throw new Error("Note not found");
    const deletedNote = notes.splice(index, 1);
    console.log("Mock API: Deleted Note ID:", id);
    return simulateApiCall({ success: true, deleted: deletedNote[0] });
};

// --- Accounts API (Mock) ---
export const getAccountRecords = async () => simulateApiCall(accountRecords);
export const addAccountRecord = async (recordData) => {
    await delay(300);
    const newRecord = { ...recordData, id: `a${Date.now()}`, amount: Number(recordData.amount) || 0, date: recordData.date ? formatISO(new Date(recordData.date)) : formatISO(new Date()) };
    accountRecords.push(newRecord);
    console.log("Mock API: Added Account Record:", newRecord);
    return simulateApiCall(newRecord);
};
export const updateAccountRecord = async (id, updatedData) => {
    await delay(300);
    const index = accountRecords.findIndex(r => r.id === id);
    if (index === -1) throw new Error("Account record not found");
    accountRecords[index] = { ...accountRecords[index], ...updatedData, amount: Number(updatedData.amount) || 0, date: updatedData.date ? formatISO(new Date(updatedData.date)) : accountRecords[index].date };
    console.log("Mock API: Updated Account Record:", accountRecords[index]);
    return simulateApiCall(accountRecords[index]);
};
export const deleteAccountRecord = async (id) => {
    await delay(400);
    const index = accountRecords.findIndex(r => r.id === id);
    if (index === -1) throw new Error("Account record not found");
    const deletedRecord = accountRecords.splice(index, 1);
    console.log("Mock API: Deleted Account Record ID:", id);
    return simulateApiCall({ success: true, deleted: deletedRecord[0] });
};
export const getWeeklySummary = async () => {
    await delay(400);
    const today = startOfDay(new Date(2025, 4, 2)); // Using context date: May 2, 2025
    const oneWeekAgo = subDays(today, 6);
    const relevantRecords = accountRecords.filter(r => {
        try { if (!r.date) return false; const recordDate = startOfDay(parseISO(r.date)); return recordDate >= oneWeekAgo && recordDate <= today; }
        catch (e) { console.warn(`Could not parse date for record ID ${r.id}: ${r.date}`, e); return false; }
    });
    const credit = relevantRecords.filter(r => r.type === 'credit').reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const debit = relevantRecords.filter(r => r.type === 'debit').reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    console.log("Mock API: Calculated Weekly Summary:", { credit, debit });
    return simulateApiCall({ credit, debit });
}