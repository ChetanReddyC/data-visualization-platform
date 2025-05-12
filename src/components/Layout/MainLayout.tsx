import React from 'react';
import { Outlet, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import Dashboard from '../Dashboard/Dashboard';
import styles from './MainLayout.module.css';

const HomePage = () => <Dashboard />;
const NotificationsPage = () => <div style={{padding: '20px'}}>Notifications Content Area</div>;
const HistoryPage = () => <div style={{padding: '20px'}}>History Content Area</div>;
const UploadPage = () => <div style={{padding: '20px'}}>Upload Data Content Area</div>;
const SettingsPage = () => <div style={{padding: '20px'}}>Settings Content Area</div>;
const ProfilePage = () => <div style={{padding: '20px'}}>Profile Content Area</div>;

const MainLayout: React.FC = () => {
  return (
    <div className={styles.mainLayout}>
      <Sidebar />
      <div className={styles.contentArea}>
        <Header />
        <main className={`${styles.mainContent} scrollable-content`}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Dashboard />} /> 
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 