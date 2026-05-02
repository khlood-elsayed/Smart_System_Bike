import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function Onboard3({ navigate }) {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", overflow: "auto", background: "white" }}>
      <div className="onboard-img" style={{ background: "#f0f8ff", height: "auto", padding: 0, lineHeight: 0 }}>
        <img src="/images/Onboard3.png" alt="trophy illustration" style={{ width: "100%", height: "auto", objectFit: "contain", display: "block" }} />
      </div>
      <div style={{ padding: "16px 28px 32px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: DARK, marginTop: 0 }}>Earn & Progress</h2>
        <p style={{ marginTop: 8, color: "#888", fontSize: 15, lineHeight: 1.5 }}>Ride to earn points, unlock badges, and track your impact.</p>
        <div className="progress-dots" style={{ marginTop: 16 }}>
          <div className="dot" />
          <div className="dot" />
          <div className="dot active" />
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={() => navigate("welcome")} style={{ marginTop: "auto", width: "100%" }}>Get Started</button>
      </div>
    </div>
  );
}