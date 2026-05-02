import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function HowToRideScreen({ navigate }) {
  const steps = [
    { icon: <Icons.MapIcon size={64} color={DARK} />, num: 1, title: "Find a Nearby Bike", desc: "Open the map and choose the closest available bike." },
    { icon: <Icons.SmartphoneIcon size={64} color={DARK} />, num: 2, title: "Unlock Instantly", desc: "Scan the QR code or tap NFC to unlock." },
    { icon: <Icons.BikeIconSVG size={64} color={DARK} />, num: 3, title: "Ride Freely", desc: "Ride safely. pause and lock anytime without ending your trip." },
  ];
  return (
    <div style={{ minHeight: "100%", background: "white" }}>
      <StatusBar />
      <div style={{ padding: "8px 24px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <BackBtn onBack={() => navigate("map")} />
          <div className="page-title">How To Ride?</div>
        </div>
        {steps.map(s => (
          <div key={s.num} className="how-to-card">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div className="step-number">{s.num}</div>
              <div style={{ fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>{s.title}</div>
            </div>
            <div style={{ background: "#eef8e0", borderRadius: 16, height: 140, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>{s.icon}</div>
            <p style={{ color: "#888", fontSize: 14, lineHeight: 1.5 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}