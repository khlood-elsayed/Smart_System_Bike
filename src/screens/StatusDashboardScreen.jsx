import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';
import localforage from 'localforage';

export default 
function StatusDashboardScreen({ navigate, state, setState }) {
  // Sync live user status from localStorage so Admin updates reflect immediately
  useEffect(() => {
    if (!state.user?.phone) return;

    const interval = setInterval(async () => {
      try {
        const appUsers = await localforage.getItem('app_users') || [];
        const latestUser = appUsers.find(u => u.phone === state.user.phone);
        
        if (latestUser && latestUser.status !== state.user.status) {
          console.log("Status update detected in Dashboard:", state.user.status, "->", latestUser.status);
          
          // If status upgraded to Verified, log them in!
          if (latestUser.status === 'verified') {
            setState(s => ({ ...s, user: { ...s.user, ...latestUser, status: 'verified' } })); 
            navigate('map');
          } else {
            setState(s => ({ ...s, user: { ...s.user, ...latestUser } }));
          }
        }
      } catch(e) {}
    }, 3000);

    return () => clearInterval(interval);
  }, [state.user?.phone, state.user?.status]);

  const progressSteps = [
    { label: "Phone Verified", completed: true },
    { label: "Documents Uploaded", completed: true },
    { label: "Admin Review", completed: state.user.status === 'verified', inProgress: state.user.status === 'pending', needsCorrection: state.user.status === 'needs_correction' }
  ];

  function handleLogout() {
    localStorage.removeItem('bike_app_user');
    setState(s => ({ ...s, user: { name: "", email: "", profilePic: "", role: "", phone: "", first: "", last: "", status: null } }));
    navigate('welcome');
  }

  return (
    <div style={{ minHeight: "100%", background: "white", display: "flex", flexDirection: "column", padding: "20px 24px 24px" }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>Verification Status</h2>
      <p style={{ color: "#888", marginBottom: 24, fontSize: 14 }}>Your account is being reviewed</p>

      {state.user?.isReturningPendingUser && (
        <div style={{
          background: "#e3f2fd",
          border: "1px solid #90caf9",
          borderRadius: 8,
          padding: 12,
          marginBottom: 24
        }}>
          <div style={{ color: "#1976d2", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
            <Icons.CheckIcon size={18} color="#1976d2" />
            Welcome back!
          </div>
          <p style={{ color: "#555", fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>
            Your account is still being reviewed by our team. We'll notify you as soon as it's verified.
          </p>
        </div>
      )}

      {state.user.correctionReason && state.user.status === 'needs_correction' && (
        <div style={{ background: "#fff3cd", border: "1px solid #ffe69c", padding: 16, borderRadius: 12, marginBottom: 24, boxShadow: "0 4px 12px rgba(255,152,0,0.1)" }}>
          <div style={{ fontWeight: 700, color: "#ff6b35", fontSize: 13, marginBottom: 6, display: "flex", alignItems: "center", gap: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <Icons.AlertTriangleIcon size={16} color="#ff6b35" />
            Admin Feedback
          </div>
          <div style={{ color: "#555", fontSize: 13, lineHeight: 1.5, fontWeight: 500 }}>
            {state.user.correctionReason}
          </div>
        </div>
      )}
      
      {!state.user.correctionReason && state.user.status === 'needs_correction' && (
        <div style={{ background: "#fff3cd", padding: 12, borderRadius: 8, marginBottom: 24 }}>
          <div style={{ fontWeight: 600, color: "#ff6b35", fontSize: 13, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <Icons.AlertTriangleIcon size={16} color="#ff6b35" />
            Action Required
          </div>
          <div style={{ color: "#555", fontSize: 12, lineHeight: 1.5 }}>
            Your previous verification attempt needs correction. Please verify your details and resubmit photos.
          </div>
        </div>
      )}

      <div style={{ background: "#f8f8f8", borderRadius: 16, padding: 20, marginBottom: 24 }}>
        {progressSteps.map((step, idx) => {
          let iconColor = "#ccc";
          let bgColor = "#e8e8e8";
          let IconComponent = null;

          if (step.completed) {
            iconColor = "#CCFF00";
            bgColor = "#CCFF0015";
            IconComponent = <Icons.CheckCircleIcon size={18} color={iconColor} />;
          } else if (step.needsCorrection) {
            iconColor = "#ff6b35";
            bgColor = "#ff6b3515";
            IconComponent = <Icons.AlertTriangleIcon size={18} color={iconColor} />;
          } else if (step.inProgress) {
            iconColor = "#ff9800";
            bgColor = "#fff3cd";
            IconComponent = <Icons.ClockIcon size={18} color={iconColor} />;
          }

          return (
            <div key={idx} style={{ marginBottom: idx < progressSteps.length - 1 ? 20 : 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {IconComponent}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: DARK, marginBottom: 4 }}>{step.label}</div>
                  {step.needsCorrection && <div style={{ fontSize: 12, color: "#ff6b35" }}>Action required</div>}
                  {step.inProgress && <div style={{ fontSize: 12, color: "#ff9800" }}>In progress...</div>}
                </div>
              </div>
              {idx < progressSteps.length - 1 && <div style={{ marginLeft: 16, marginTop: 12, height: 24, borderLeft: "2px solid #e8e8e8" }} />}
            </div>
          );
        })}
      </div>

      <div style={{ background: "#f0f8e0", borderRadius: 12, padding: 16, marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 10 }}>
        <Icons.ClockIcon size={20} color="#2e7d32" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
          <strong>Expected wait time:</strong> Usually 24 hours<br />
          We'll notify you via email once your account is verified.
        </div>
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {state.user.status === 'needs_correction' && (
          <button className="btn-primary" onClick={() => navigate('needCorrection')} style={{ width: "100%", background: "#ff6b35", color: "white", display: "flex", gap: 8, justifyContent: "center" }}>
            <Icons.AlertTriangleIcon size={18} color="currentColor" /> Review & Fix Application
          </button>
        )}
        <button className="btn-secondary" onClick={handleLogout} style={{ width: "100%" }}>Logout</button>
      </div>
    </div>
  );
}