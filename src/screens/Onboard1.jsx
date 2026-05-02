import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function Onboard1({ navigate }) {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div className="onboard-img" style={{ background: "#f8fef0" }}>
        <img src="/images/Onboard1.png" alt="map illustration" style={{ height: "280px", objectFit: "contain" }} />
      </div>
      <div style={{ padding: "24px 28px 32px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: DARK }}>Enjoy Your Ride</h2>
        <p style={{ marginTop: 10, color: "#888", fontSize: 15, lineHeight: 1.5 }}>See nearby bikes on the map and head to the closest one</p>
        <div className="progress-dots" style={{ marginTop: 24 }}>
          <div className="dot active" />
          <div className="dot" />
          <div className="dot" />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button style={{ background: "none", border: "none", color: "#888", fontSize: 16, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }} onClick={() => navigate("welcome")}>Skip</button>
          <button className="btn-primary" style={{ width: "auto", padding: "14px 32px" }} onClick={() => navigate("onboard2")}>Next →</button>
        </div>
      </div>
    </div>
  );
}