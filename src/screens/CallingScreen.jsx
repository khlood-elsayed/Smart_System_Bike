import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function CallingScreen({ navigate }) {
  return (
    <div style={{ background: "#2a2a2a", minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <BackBtn onBack={() => navigate("riding")} light />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "white", fontSize: 20, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 40 }}>Emergency Services</div>
        <div style={{ width: 120, height: 120, background: LIME, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, animation: "popIn 0.5s" }}>
          <Icons.PhoneIcon size={52} color={DARK} />
        </div>
        <div style={{ color: "white", fontSize: 18, fontWeight: 600, letterSpacing: 2, animation: "pulse 1.5s infinite" }}>CALLING....</div>
      </div>
      <div style={{ display: "flex", gap: 60, marginBottom: 40 }}>
        <button className="call-btn" style={{ background: "white", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icons.PhoneIcon size={28} color={DARK} />
        </button>
        <button className="call-btn" style={{ background: "#FF3B30", display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => navigate("riding")}>
          <Icons.PhoneIcon size={28} color="white" style={{ transform: 'rotate(135deg)' }} />
        </button>
      </div>
    </div>
  );
}