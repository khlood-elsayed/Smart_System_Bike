import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function HistoryScreen({ navigate, state }) {
  const rides = state?.user?.rideHistory || [];

  return (
    <div style={{ minHeight: "100%", background: "#f8f9fa" }}>
      <StatusBar />
      <div style={{ padding: "8px 20px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <BackBtn onBack={() => navigate("map")} />
          <div className="page-title" style={{ fontSize: 24 }}>My Rides</div>
        </div>
        
        {rides.length > 0 ? rides.map((r, i) => (
          <div key={r.id || i} className="history-card" style={{ 
            background: "white", 
            borderRadius: 24, 
            padding: 20, 
            marginBottom: 16, 
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)", 
            border: "1px solid #eee",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CAF50" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#4CAF50", textTransform: "uppercase", letterSpacing: 0.5 }}>{r.status || "Completed"}</span>
              </div>
              <div style={{ color: "#888", fontSize: 12, fontWeight: 600 }}>
                {new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} • {r.duration || "12m"}
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
               <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", border: `2.5px solid ${DARK}`, background: "white" }} />
                  <div style={{ width: 2, flex: 1, background: "#eee", margin: "4px 0" }} />
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: DARK }} />
               </div>
               <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 11, color: "#aaa", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Pickup</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{r.from || "Unknown Station"}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 11, color: "#aaa", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Drop-off</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{r.to || "Unknown Station"}</span>
                  </div>
               </div>
            </div>

            <div style={{ borderTop: "1.5px dashed #eee", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>{r.cost} <span style={{fontSize:12}}>EGP</span></span>
              </div>
              <button 
                onClick={() => alert("Generating receipt PDF...\n\nTransaction ID: TR-" + (r.id || Date.now()))}
                style={{ 
                  background: "#f0f0f0", 
                  border: "none", 
                  borderRadius: 12, 
                  padding: "10px 16px", 
                  fontSize: 13, 
                  fontWeight: 700, 
                  color: DARK,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer"
                }}
              >
                <Icons.WalletIcon size={16} /> Receipt
              </button>
            </div>
          </div>
        )) : (
          <div style={{ textAlign: "center", padding: "100px 40px" }}>
            <div style={{ width: 80, height: 80, background: "#f0f0f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Icons.BikeIconSVG size={40} color="#ccc" />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: DARK, marginBottom: 8 }}>No Rides Yet</div>
            <p style={{ color: "#888", fontSize: 14, lineHeight: 1.5, marginBottom: 32 }}>Your past trips and transaction history will appear here once you finish your first ride.</p>
            <button className="btn-primary" onClick={() => navigate("map")}>Find a Bike</button>
          </div>
        )}
      </div>
    </div>
  );
}