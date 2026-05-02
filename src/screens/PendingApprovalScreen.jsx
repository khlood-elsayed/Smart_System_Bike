import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function PendingApprovalScreen({ navigate, state }) {
  const illustrationUrl = "https://raw.githubusercontent.com/Almousa-Dev/Smart-Bike-Assets/main/verification_pending.png";
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "white", padding: 32 }}>
      <img src={illustrationUrl} alt="Verification Pending" style={{ width: 120, height: 120, marginBottom: 32, opacity: 0.7 }} onError={(e) => { e.target.style.display = "none"; }} />
      <h2 style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", textAlign: "center", marginBottom: 12 }}>Verification in Progress</h2>
      <div style={{ padding: 20, background: '#f5f5f5', borderRadius: '50%', marginBottom: 32 }}>
        <Icons.ClockIcon size={48} color={DARK} />
      </div>
      <p style={{ color: "#666", textAlign: "center", lineHeight: 1.6, maxWidth: 280, marginBottom: 48 }}>Our team is reviewing your documents. You will be notified once your account is active.</p>
      <button className="btn-primary" onClick={() => navigate("statusDashboard")} style={{ width: "100%" }}>Check Status</button>
    </div>
  );
}