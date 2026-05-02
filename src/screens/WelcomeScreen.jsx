import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function WelcomeScreen({ navigate, state }) {
  useEffect(() => {
    if (state.user?.status === 'pending') {
      navigate('statusDashboard');
    }
  }, [state.user?.status, navigate]);

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", background: "white" }}>
      <StatusBar />
      <div style={{ 
        background: LIME, 
        padding: "100px 32px 140px",
        borderRadius: "0 0 100% 30% / 0 0 45% 15%", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "flex-start",
        justifyContent: "flex-end",
        width: "120%",
        marginLeft: "-10%",
        boxShadow: "0 10px 30px rgba(196,255,12,0.15)",
        minHeight: "55vh"
      }}>
        <div style={{ paddingLeft: "10%" }}>
          <div style={{ marginBottom: 12 }}>
             <Icons.BikeLogo size={110} />
          </div>
          <div style={{ fontSize: 48, fontWeight: 900, fontFamily: "'Inter', sans-serif", color: DARK, letterSpacing: "-1.5px" }}>Smart Bike</div>
        </div>
      </div>

      <div style={{ padding: "80px 32px 40px", flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
        <button 
          className="btn-primary" 
          onClick={() => navigate("register")} 
          style={{ height: 56, borderRadius: 28, fontSize: 16, fontWeight: 700, background: LIME, color: DARK }}
        >
          Create Account
        </button>
        <button 
          className="btn-secondary" 
          onClick={() => navigate("login")} 
          style={{ height: 56, borderRadius: 28, fontSize: 16, fontWeight: 700, background: "rgba(196, 255, 12, 0.3)", color: DARK }}
        >
          Login
        </button>
      </div>
    </div>
  );
}