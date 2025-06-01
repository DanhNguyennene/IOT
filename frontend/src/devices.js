import React from 'react';
import Sidebar from './sidebar';
import './devices.css';

const DevicesPage = () => {
  return (
    <div className="devices-page">
      <Sidebar activePage="DEVICES" />
      <main className="devices-main-content">
        <header className="devices-header">
          <h1>Devices Management</h1>
          <button className="add-device-button">+ Add New Device</button>
        </header>
        
        <div className="devices-grid">
          <div className="devices-placeholder">
            <h2>No Devices Added Yet</h2>
            <p>Click the button above to add your first smart device</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DevicesPage; 