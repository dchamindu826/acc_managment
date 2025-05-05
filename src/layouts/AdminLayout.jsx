import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import styles from './AdminLayout.module.css'; // Optional layout specific styles

const AdminLayout = () => {
  return (
    <div className={styles.adminLayout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Topbar />
        <main className={styles.pageContent}>
          <Outlet /> {/* This is where nested routes will render */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;