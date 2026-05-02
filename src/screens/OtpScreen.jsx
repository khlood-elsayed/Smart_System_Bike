import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK, EMERALD } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function OtpScreen({ navigate, state, setState }) {
  const [vals, setVals] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState("");
  const [notificationSent, setNotificationSent] = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef()];
  const CORRECT_CODE = "1234";
  const otpMethod = state.otpMethod || "sms";

  // Send notification when component mounts
  useEffect(() => {
    async function initNotification() {
      await sendOtpNotification(otpMethod, CORRECT_CODE, state.user.phone);
      setNotificationSent(true);
    }
    initNotification();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  function handleChange(i, v) {
    if (!/^\d?$/.test(v)) return;
    const newVals = [...vals];
    newVals[i] = v;
    setVals(newVals);
    if (v && i < 3) refs[i + 1].current?.focus();
    setError(""); // Clear error when user starts typing
  }

  function handleVerify() {
    const enteredCode = vals.join("");
    if (enteredCode.length !== 4) {
      setError("Please enter all 4 digits");
      return;
    }

    if (enteredCode === CORRECT_CODE) {
      // Mark phone as verified in user state
      setState(s => ({ ...s, user: { ...s.user, phoneVerified: true } }));
      navigate("phoneVerified");
    } else {
      setError("Invalid code. Test with 1234");
      setVals(["", "", "", ""]);
      refs[0].current?.focus();
    }
  }

  const isAllFilled = vals.every(v => v !== "");

  return (
    <div style={{ minHeight: "100%", background: "white" }}>
      <StatusBar />
      <div style={{ padding: "8px 24px 32px" }}>
        <BackBtn onBack={() => navigate("otpMethod")} />
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <div className="page-title">Verification code</div>
          <p className="page-subtitle" style={{ marginTop: 8 }}>A verification code has been sent to <span style={{ fontWeight: 700, color: DARK }}>{state.user?.phone || "[Phone Number]"}</span></p>
        </div>

        {/* Notification sent indicator */}
        {notificationSent && (
          <div style={{
            background: "#f0f9ff",
            border: `1px solid ${EMERALD}`,
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <Icons.CheckCircleIcon size={18} color={EMERALD} />
            <span style={{ color: "#333", fontSize: 13, fontWeight: 500 }}>
              {otpMethod === "whatsapp" ? "Notification sent via WhatsApp" : "SMS sent to your phone"}
            </span>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 28 }}>
          {vals.map((v, i) => (
            <input
              key={i}
              ref={refs[i]}
              className={`otp-box ${v ? "filled" : ""} ${i === vals.indexOf("") ? "active" : ""}`}
              maxLength={1}
              value={v}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => e.key === "Backspace" && !v && i > 0 && refs[i - 1].current?.focus()}
              type="text"
              inputMode="numeric"
            />
          ))}
        </div>
        {error && <div style={{ color: "#FF3B30", fontSize: 13, textAlign: "center", marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Icons.AlertTriangleIcon size={16} color="#FF3B30" /> {error}
        </div>}
        <div style={{ textAlign: "center", color: "#888", fontSize: 14, marginBottom: 20 }}>
          {`00:${String(timer).padStart(2, "0")}`}
        </div>
        <button
          className="btn-primary"
          onClick={handleVerify}
          disabled={!isAllFilled}
          style={{ marginBottom: 12, opacity: isAllFilled ? 1 : 0.5 }}
        >
          Verify Code
        </button>
        <p style={{ textAlign: "center", fontSize: 14, color: "#888" }}>
          Didn't Receive OTP?{" "}
          <span style={{ color: EMERALD, fontWeight: 700, cursor: "pointer" }} onClick={() => { setTimer(30); setNotificationSent(false); sendOtpNotification(otpMethod, CORRECT_CODE, state.user.phone).then(() => setNotificationSent(true)); }}>Send Again</span>
        </p>
      </div>
    </div>
  );
}