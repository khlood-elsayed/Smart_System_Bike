import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function SettingsScreen({ navigate }) {
  const [notifs, setNotifs] = useState(false);
  const [dark, setDark] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [lang, setLang] = useState("English");
  const [showLogout, setShowLogout] = useState(false);

  return (
    <div style={{ minHeight: "100%", background: "white" }}>
      <StatusBar />
      <div style={{ padding: "8px 24px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <BackBtn onBack={() => navigate("map")} />
          <div className="page-title">Settings</div>
        </div>
        <div className="settings-group" style={{ marginBottom: 16 }}>
          <div className="settings-item">
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}><Icons.BellIcon size={20} color={DARK} /></span>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>Notifications</span>
            <div className={`toggle ${notifs ? "on" : ""}`} onClick={() => setNotifs(!notifs)} />
          </div>
          <div className="settings-item">
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}><Icons.MoonIcon size={20} color={DARK} /></span>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>Dark Mode</span>
            <div className={`toggle ${dark ? "on" : ""}`} onClick={() => setDark(!dark)} />
          </div>
          <div className="settings-item" onClick={() => setShowLang(true)}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}><Icons.GlobeIcon size={20} color={DARK} /></span>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>Language</span>
            <span style={{ color: "#888", fontSize: 14, marginRight: 8 }}>{lang}</span>
            <Icons.ChevronRightIcon size={16} color="#aaa" />
          </div>
        </div>
        <div className="settings-group" style={{ marginBottom: 32 }}>
          <div className="settings-item" onClick={() => navigate("legal")}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}><Icons.HelpCircleIcon size={20} color={DARK} /></span>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>Support</span>
            <Icons.ChevronRightIcon size={16} color="#aaa" />
          </div>
          <div className="settings-item" onClick={() => navigate("legal")}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}><Icons.ShieldIcon size={20} color={DARK} /></span>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>Privacy & Terms</span>
            <Icons.ChevronRightIcon size={16} color="#aaa" />
          </div>
          <div className="settings-item" onClick={() => setShowLogout(true)}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}><Icons.LogOutIcon size={20} color={DARK} /></span>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>Log Out</span>
            <Icons.ChevronRightIcon size={16} color="#aaa" />
          </div>
        </div>
        <button style={{ width: "100%", padding: "16px", background: "transparent", color: "#FF3B30", border: "2px solid #FF3B30", borderRadius: 50, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", fontSize: 15 }}>
          Delete Account
        </button>
      </div>

      {showLang && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="sheet-handle" />
            {["English", "Arabic"].map(l => (
              <div key={l} className={`payment-method-item ${lang === l ? "selected" : ""}`} style={{ marginBottom: 10 }} onClick={() => setLang(l)}>
                <span style={{ flex: 1, fontWeight: 600 }}>{l}</span>
                <div className={`radio-circle ${lang === l ? "selected" : ""}`} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="btn-outline" onClick={() => setShowLang(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowLang(false)}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showLogout && (
        <div className="modal-overlay modal-overlay-center">
          <div className="modal-card">
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ffebee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Icons.LogOutIcon size={32} color="#FF3B30" />
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>Log out?</div>
              <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>You'll need to sign in again to use Smart Bike.</p>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn-danger" style={{ flex: 1 }} onClick={() => navigate("welcome")}>Log Out</button>
                <button className="btn-outline" style={{ flex: 1 }} onClick={() => setShowLogout(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}