// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner.jsx';
// Import AuthProvider if/when login is added
// import { AuthProvider } from './context/AuthContext.jsx';

// Lazy load page components
const Payments = lazy(() => import('./pages/Payments/Payments.jsx'));
const Accounts = lazy(() => import('./pages/Accounts/Accounts.jsx'));
const Employers = lazy(() => import('./pages/Employers/Employers.jsx'));
const Chemicals = lazy(() => import('./pages/Chemicals/Chemicals.jsx'));
const Outstanding = lazy(() => import('./pages/Outstanding/Outstanding.jsx'));
const Gatepass = lazy(() => import('./pages/Gatepass/Gatepass.jsx'));
const Notes = lazy(() => import('./pages/Notes/Notes.jsx')); // <-- Lazy load Notes

function App() {
  return (
    // <AuthProvider> {/* Wrap with AuthProvider when login is added */}
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            {/* Public routes like Login would go here, outside AdminLayout */}
            {/* <Route path="/login" element={<LoginPage />} /> */}

            {/* Routes requiring Admin Layout */}
            {/* ProtectedRoute wrapper would go here if login is added */}
              <Route path="/" element={<AdminLayout />}>
                <Route index element={<Navigate to="/payments" replace />} />
                <Route path="payments" element={<Payments />} />
                <Route path="accounts" element={<Accounts />} />
                <Route path="employers" element={<Employers />} />
                <Route path="chemicals" element={<Chemicals />} />
                <Route path="outstanding" element={<Outstanding />} />
                <Route path="gatepass" element={<Gatepass />} />
                <Route path="notes" element={<Notes />} /> {/* <-- New Route for Notes */}

                {/* Catch-all 404 for routes inside the layout */}
                <Route path="*" element={<div style={{ padding: '2rem' }}><h2>404 Not Found</h2><p>The page requested inside the admin area does not exist.</p></div>} />
              </Route>
            {/* </Route> */} {/* Closing ProtectedRoute */}

             {/* Optional: Catch-all for routes completely outside the layout */}
             {/* <Route path="*" element={<h2>404 - Page Not Found</h2>} /> */}

          </Routes>
        </Suspense>
      </BrowserRouter>
    // </AuthProvider>
  );
}

export default App;