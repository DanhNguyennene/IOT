import React from 'react';
import Sidebar from './sidebar';
import './setting.css';
import FaceIDSettings from './faceidcontrol'; 
const SettingPage = () => {
  return (
    <div className="setting-page">
      <Sidebar activePage="SETTING" />
      <main className="setting-main-content">
        <header className="setting-header">
          <h1>Settings</h1>
        </header>
        
        <div className="setting-sections">
          <section className="setting-section">
            <h2>Account Settings</h2>
            <div className="setting-placeholder">
              <p>Account management options will appear here</p>
            </div>
          </section>
          
          <section className="setting-section">
          <h2>System Settings</h2>
          <div className="setting-placeholder">
            <FaceIDSettings />
          </div>
        </section>
          
          <section className="setting-section">
            <h2>Notifications</h2>
            <div className="setting-placeholder">
              <p>Notification preferences will appear here</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SettingPage; 