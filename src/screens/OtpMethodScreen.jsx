import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function OtpMethodScreen({ navigate, state, setState }) {
  const [method, setMethod] = useState("sms");
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");

  function handleSendOtp() {
    if (method === "whatsapp") {
      // Simulate WhatsApp API connection
      setLoading(true);
      setApiMessage("Connecting to WhatsApp API...");

      setTimeout(() => {
        setLoading(false);
        // Store selected method in state for later use
        setState(s => ({ ...s, otpMethod: method }));
        navigate("otp");
      }, 2000);
    } else {
      // SMS goes directly
      setState(s => ({ ...s, otpMethod: method }));
      navigate("otp");
    }
  }

  return (
    <div style={{ minHeight: "100%", background: "white" }}>
      <StatusBar />
      <div style={{ padding: "8px 24px 32px" }}>
        <BackBtn onBack={() => navigate("login")} />
        <div style={{ marginTop: 20, marginBottom: 32 }}>
          <div className="page-title">Verify Password</div>
          <p className="page-subtitle" style={{ marginTop: 8 }}>Choose how to receive your code</p>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          {["sms", "whatsapp"].map(m => (
            <button
              key={m}
              onClick={() => !loading && setMethod(m)}
              disabled={loading}
              style={{
                flex: 1, padding: "14px", border: `2px solid ${method === m ? DARK : "#e0e0e0"}`,
                borderRadius: 14, background: method === m ? "#f0f0f0" : "white",
                display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
                cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif",
                fontSize: 14, transition: "all 0.2s", opacity: loading && method !== m ? 0.5 : 1
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: "50%", border: `2px solid ${method === m ? LIME : "#ccc"}`,
                background: method === m ? LIME : "transparent", display: "inline-block"
              }} />
              {m === "sms" ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icons.SmartphoneIcon size={18} color="currentColor" /> SMS
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icons.MessageSquareIcon size={18} color="currentColor" /> WhatsApp
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Loading state for WhatsApp */}
        {loading && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div className="spinner" style={{ width: 40, height: 40, borderTopColor: LIME, margin: "0 auto 12px" }} />
            <p style={{ color: "#666", fontSize: 14, fontWeight: 600 }}>{apiMessage}</p>
          </div>
        )}

        <button
          className="btn-primary"
          onClick={handleSendOtp}
          disabled={loading}
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Connecting..." : "Send OTP"}
        </button>
      </div>
    </div>
  );
}