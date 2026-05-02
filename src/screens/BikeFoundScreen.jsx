import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function BikeFoundScreen({ navigate }) {
  return (
    <div style={{ height: "100%", position: "relative" }}>
      <div style={{ height: "45%" }}>
        <FakeMap bikes={BIKES.slice(0, 2)} />
      </div>
      <div style={{ position: "absolute", top: "36%", left: 0, right: 0, padding: "0 20px" }}>
        <div style={{ background: "white", borderRadius: 24, padding: 28, boxShadow: "0 -4px 24px rgba(0,0,0,0.12)" }}>
          <BackBtn onBack={() => navigate("map")} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0 20px" }}>
            <div style={{ width: 64, height: 64, background: "#e8ffc0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Icons.CheckIcon size={32} color={DARK} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif" }}>Bike Found!</div>
            <div style={{ color: "#888", fontSize: 14, marginTop: 4 }}>Ready to ride.</div>
          </div>
          <div style={{ border: "2px solid #e8e8e8", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <Icons.BikeIconSVG size={28} color={DARK} />
            <div>
              <div style={{ fontWeight: 700 }}>Bike #2847</div>
              <div style={{ color: "#888", fontSize: 13 }}>📍 2 Meters Away</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={() => navigate("scanQR")}>
              <Icons.MaximizeIcon size={18} color="currentColor" /> Scan To Unlock
            </button>
            <button className="btn-outline" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={() => navigate("map")}>
              <Icons.MapIcon size={18} color="currentColor" /> Back To Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}