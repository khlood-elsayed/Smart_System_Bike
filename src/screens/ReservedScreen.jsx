import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function ReservedScreen({ navigate }) {
  useEffect(() => { const t = setTimeout(() => navigate("map"), 2500); return () => clearTimeout(t); }, [navigate]);
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "white", padding: 32 }}>
      <div className="success-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icons.CheckIcon size={40} color={DARK} />
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", textAlign: "center" }}>Bike Reserved!</h2>
      <p style={{ color: "#888", textAlign: "center", marginTop: 10 }}>Your bike is reserved for 15 minutes.</p>
      <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 8, color: "#888", fontSize: 14 }}>
        <Icons.ClockIcon size={18} color="#888" /> Please arrive before the timer expires.
      </div>
    </div>
  );
}