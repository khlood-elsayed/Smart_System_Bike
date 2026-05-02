import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function AdminScreen({ navigate, state, setState }) {
  const [approvalEmail, setApprovalEmail] = useState("");
  const [approvalMessage, setApprovalMessage] = useState("");

  useEffect(() => {
    if (state.user.role !== 'admin') {
      navigate('map');
    }
  }, [state.user.role, navigate]);

  function handleApproveUser() {
    if (!approvalEmail.trim()) {
      setApprovalMessage("Please enter an email address.");
      return;
    }
    // Simulate backend approval by updating user status
    const updatedUser = { ...state.user, status: 'approved' };
    setState(s => ({ ...s, user: updatedUser }));
    localStorage.setItem('bike_app_user', JSON.stringify(updatedUser));
    setApprovalMessage(`User ${approvalEmail} has been approved! They can now access the app.`);
    setApprovalEmail("");
  }

  return (
    <div style={{ minHeight: '100%', background: 'white', padding: 24, display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <div style={{ padding: '8px 24px 32px' }}>
        <BackBtn onBack={() => navigate('map')} />
        <div className="page-title" style={{ marginTop: 20, marginBottom: 8 }}>Admin Dashboard</div>
        <p style={{ color: '#888', marginTop: 0, marginBottom: 24 }}>Welcome, {state.user.name}! You have admin access.</p>

        <div style={{ background: '#f8f8f8', borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, fontFamily: "'Space Grotesk',sans-serif" }}>Approve User Verification</h3>
          <div style={{ marginBottom: 12 }}>
            <label className="input-label">User Email</label>
            <input
              className="input-field"
              placeholder="user@example.com"
              value={approvalEmail}
              onChange={(e) => setApprovalEmail(e.target.value)}
              type="email"
            />
          </div>
          <button className="btn-primary" onClick={handleApproveUser} style={{ width: '100%' }}>Approve User</button>
        </div>

        {approvalMessage && (
          <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: 12, padding: 16, color: '#155724', marginBottom: 24 }}>
            {approvalMessage}
          </div>
        )}

        <div style={{ background: '#e7f3ff', borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 13, color: '#0056b3', lineHeight: 1.6 }}>
            <strong>How it works:</strong><br />
            1. Enter a pending user's email<br />
            2. Click "Approve User" to update their status<br />
            3. Their status changes to 'verified' in localStorage<br />
            4. They'll have full app access on next login
          </div>
        </div>
      </div>
    </div>
  );
}