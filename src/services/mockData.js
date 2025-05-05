// src/services/mockData.js
import { formatISO } from 'date-fns';

// --- Payments Mock Data ---
let payments = [
  { id: 'p1', date: formatISO(new Date(2025, 4, 1)), reason: 'Office Supplies', forWhom: 'Stationery Shop', amount: 75.50 },
  { id: 'p2', date: formatISO(new Date(2025, 4, 1)), reason: 'Lunch Meeting', forWhom: 'Client X', amount: 120.00 },
  { id: 'p3', date: formatISO(new Date(2025, 3, 30)), reason: 'Software Subscription', forWhom: 'SaaS Inc.', amount: 49.99 },
  { id: 'p4', date: formatISO(new Date(2025, 3, 29)), reason: 'Travel Expense', forWhom: 'Alice Smith', amount: 210.80 },
];

// --- Employers Mock Data (Updated with more fields) ---
let employers = [
    {
        id: 'e1', name: 'Alice Smith', role: 'Senior Developer', department: 'Technology', salary: 75000, otRate: 450,
        address: '123 Galle Road, Colombo 03', birthday: '1990-05-15', email: 'alice.smith@example.com',
        contactNumber: '077-1234567', nic: '901361234V', bankAccount: '1234-5678-9012 - Commercial Bank (Borella)',
    },
    {
        id: 'e2', name: 'Bob Johnson', role: 'UI/UX Designer', department: 'Creative', salary: 65000, otRate: 400,
        address: '45 Park Street, Colombo 02', birthday: '1992-11-20', email: 'bob.j@example.com',
        contactNumber: '071-9876543', nic: '923254567V', bankAccount: '9876-5432-1098 - HNB (Kandy City Center)',
    },
    {
        id: 'e3', name: 'Charlie Brown', role: 'Project Manager', department: 'Management', salary: 95000, otRate: 0,
        address: '78 Temple Lane, Kandy', birthday: '1985-02-10', email: 'charlie.manager@example.com',
        contactNumber: '076-5551111', nic: '850411234V', bankAccount: '1122-3344-5566 - Sampath Bank (Head Office)',
    },
];

// --- Chemicals Mock Data ---
let chemicals = [
    { id: 'c1', name: 'Hydrochloric Acid (HCl)', quantity: 50, unit: 'L', lastUpdated: formatISO(new Date(2025, 4, 1)), purchaseHistory: [], usageHistory: [] },
    { id: 'c2', name: 'Sodium Hydroxide (NaOH)', quantity: 100, unit: 'kg', lastUpdated: formatISO(new Date(2025, 3, 28)), purchaseHistory: [], usageHistory: [] },
     { id: 'c3', name: 'Sulfuric Acid (H₂SO₄)', quantity: 25, unit: 'L', lastUpdated: formatISO(new Date(2025, 4, 2)), purchaseHistory: [], usageHistory: [] },
];

// --- Outstanding Mock Data (Updated Structure) ---
let outstanding = [
    { id: 'o1', type: 'receivable', name: 'Client Alpha', description: 'Invoice #INV-001', amount: 5000, date: formatISO(new Date(2025, 3, 15)), status: 'Partially Paid' },
    { id: 'o2', type: 'receivable', name: 'Customer Beta', description: 'Project Beta Final Payment', amount: 8500, date: formatISO(new Date(2025, 3, 20)), status: 'Pending' },
    { id: 'o3', type: 'payable', name: 'Supplier Gamma', description: 'Raw Material Purchase Order #PO-102', amount: 15000, date: formatISO(new Date(2025, 4, 10)), status: 'Partially Paid' },
    { id: 'o4', type: 'payable', name: 'Utility Bill - Electricity', description: 'April 2025 Bill', amount: 4500, date: formatISO(new Date(2025, 4, 20)), status: 'Pending' },
    { id: 'o5', type: 'receivable', name: 'Client Alpha', description: 'Invoice #INV-002 Retainer', amount: 0, date: formatISO(new Date(2025, 4, 1)), status: 'Paid' },
    { id: 'o6', type: 'payable', name: 'Office Rent - May', description: 'Monthly Rent', amount: 30000, date: formatISO(new Date(2025, 4, 25)), status: 'Pending' },
];

// --- Account Records Mock Data ---
let accountRecords = [
    { id: 'a1', type: 'credit', date: formatISO(new Date(2025, 4, 1)), description: 'Client Alpha Payment (INV-001 Partial)', amount: 10000 },
    { id: 'a2', type: 'debit', date: formatISO(new Date(2025, 4, 1)), description: 'Office Supplies', amount: 75.50 },
    { id: 'a3', type: 'debit', date: formatISO(new Date(2025, 4, 1)), description: 'Lunch Meeting (Client X)', amount: 120.00 },
    { id: 'a4', type: 'credit', date: formatISO(new Date(2025, 3, 28)), description: 'Customer Beta Advance', amount: 5000 },
    { id: 'a5', type: 'debit', date: formatISO(new Date(2025, 3, 30)), description: 'Software Subscription (SaaS Inc.)', amount: 49.99 },
    { id: 'a6', type: 'debit', date: formatISO(new Date(2025, 3, 29)), description: 'Travel Expense (Alice Smith)', amount: 210.80 },
    { id: 'a7', type: 'debit', date: formatISO(new Date(2025, 4, 5)), description: 'Pay Supplier Gamma (PO-102 Partial)', amount: 10000 },
];

// --- Gatepass Mock Data ---
let gatepasses = [
    {
        id: 'gp1', receiveDate: formatISO(new Date(2025, 4, 1)), sendDate: formatISO(new Date(2025, 4, 2)),
        category: 'Raw Material In', invoiceNumber: 'INV-RM-101', remarks: 'Received 10 barrels', quantity: '10 barrels',
        specialNote: 'Check quality report by Friday', noteDate: formatISO(new Date(2025, 4, 2))
    },
    {
        id: 'gp2', receiveDate: formatISO(new Date(2025, 3, 28)), sendDate: null,
        category: 'Finished Goods Out', invoiceNumber: 'INV-FG-505', remarks: 'To Client Alpha', quantity: '5 boxes',
        specialNote: '', noteDate: null
    },
    {
        id: 'gp3', receiveDate: formatISO(new Date(2025, 4, 3)), sendDate: null,
        category: 'Returnable Item Out', invoiceNumber: '', remarks: 'Sample for testing', quantity: '1 unit',
        specialNote: 'Follow up next week', noteDate: formatISO(new Date(2025, 4, 9))
    },
     {
        id: 'gp4', receiveDate: formatISO(new Date(2025, 4, 2)), sendDate: null,
        category: 'Non-Returnable In', invoiceNumber: 'CHLN-002', remarks: 'Office Stationery', quantity: '1 package',
        specialNote: 'Distribute to departments', noteDate: formatISO(new Date(2025, 4, 2))
    },
];

let notes = [
    {
        id: 'n1',
        content: 'Follow up with Client Alpha regarding INV-001 payment.',
        // Target Date/Time: May 2, 2025 09:00 AM (Example for today)
        targetDateTime: formatISO(new Date(2025, 4, 2, 9, 0, 0)),
        status: 'Pending' // Status can be 'Pending' or 'Done'
    },
    {
        id: 'n2',
        content: 'Prepare monthly sales report.',
        // Target Date/Time: May 5, 2025 05:00 PM
        targetDateTime: formatISO(new Date(2025, 4, 5, 17, 0, 0)),
        status: 'Pending'
    },
    {
        id: 'n3',
        content: 'Team meeting discussion points.',
        // Target Date/Time: May 1, 2025 10:00 AM (Example Past)
        targetDateTime: formatISO(new Date(2025, 4, 1, 10, 0, 0)),
        status: 'Done' // Example completed note
    },
    {
        id: 'n4',
        content: 'Submit tax documents.',
        // Target Date/Time: May 2, 2025 03:00 PM (Example for today)
        targetDateTime: formatISO(new Date(2025, 4, 2, 15, 0, 0)),
        status: 'Pending'
    },
];

// Export all mock data arrays
// *** === Corrected Export Line === ***
export { payments, employers, chemicals, outstanding, accountRecords, gatepasses, notes };