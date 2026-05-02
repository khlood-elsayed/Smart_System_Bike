import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function SplashScreen({ navigate }) {
  useEffect(() => {
    const t = setTimeout(() => navigate("onboard1"), 1800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ background: LIME, minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <Icons.BikeLogo size={80} color={DARK} />
      <div style={{ fontSize: 42, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: DARK, marginTop: 20 }}>Smart Bike</div>
      <div style={{ marginTop: 60 }}>
        <div className="spinner" style={{ borderTopColor: DARK, borderColor: "rgba(0,0,0,0.15)" }} />
      </div>
    </div>
  );
}