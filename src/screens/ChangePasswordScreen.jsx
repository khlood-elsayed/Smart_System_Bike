import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function ChangePasswordScreen({ navigate }) {
  return (
    <div style={{ minHeight: "100%", background: "white" }}>
      <StatusBar />
      <div style={{ padding: "8px 24px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <BackBtn onBack={() => navigate("profile")} />
          <div className="page-title">Change Password</div>
        </div>
        {[["Type Current password", "current"], ["Create New Password", "new"], ["Confirm Password", "confirm"]].map(([label, key]) => (
          <div key={key} style={{ marginBottom: 18 }}>
            <label className="input-label">{label}</label>
            <div style={{ position: "relative" }}>
              <input className="input-field" type="password" defaultValue="••••••••••••••••" style={{ paddingRight: 44 }} />
              <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#aaa", cursor: "pointer", display: 'flex' }}>
                <Icons.EyeIcon size={20} color="#aaa" />
              </span>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 24 }}>
          <button className="btn-primary" onClick={() => navigate("profile")}>Change Password</button>
        </div>
      </div>
    </div>
  );
}