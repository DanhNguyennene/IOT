import React from 'react';
import Sidebar from './sidebar';
import './family_members.css';

const FamilyMembersPage = () => {
  return (
    <div className="family-page">
      <Sidebar activePage="FAMILY MEMBERS" />
      <main className="family-main-content">
        <header className="family-header">
          <h1>Family Members</h1>
          <button className="add-member-button">+ Add Family Member</button>
        </header>
        
        <div className="family-grid">
          <div className="family-placeholder">
            <h2>No Family Members Added Yet</h2>
            <p>Click the button above to add your first family member</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FamilyMembersPage; 