import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function NotificationsScreen({ navigate, state, setState }) {
  const notifs = state?.user?.alerts || [];
  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = () => {
    if (setState) {
      setState(s => ({
        ...s,
        user: { ...s.user, alerts: notifs.map(n => ({ ...n, read: true })) }
      }));
    }
  };
  return (
    <div style={{ minHeight: "100%", background: "white" }}>
      <StatusBar />
      <div style={{ padding: "8px 24px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <BackBtn onBack={() => navigate("map")} />
          <div className="page-title">Notifications</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: "#555" }}>{unreadCount} unread</span>
          <button style={{ background: "none", border: "none", color: LIME, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }} onClick={markAllRead}>
            Mark all as read
          </button>
        </div>
        
        {notifs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", opacity: 0.5 }}>
            <Icons.BellIcon size={48} color={DARK} />
            <div style={{ marginTop: 16, fontSize: 18, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>No Notifications</div>
            <div style={{ color: "#555", marginTop: 8 }}>You're all caught up!</div>
          </div>
        ) : (
          notifs.map((n, i) => (
            <div key={i} style={{ background: "#f7f7f7", borderRadius: 14, padding: 14, marginBottom: 10, display: "flex", gap: 12, position: "relative" }}>
              <div style={{ width: 40, height: 40, background: n.isSystem ? "#ffe0e0" : "#e8e8e8", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {n.isSystem ? <Icons.AlertTriangleIcon size={20} color="#FF3B30" /> : <Icons.BikeIconSVG size={20} color={DARK} />}
              </div>
              <div style={{ flex: 1 }}>
                {n.title && <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{n.title}</div>}
                <div style={{ color: n.title ? "#888" : "#555", fontSize: 13, lineHeight: 1.4 }}>{n.body}</div>
                <div style={{ color: "#aaa", fontSize: 12, marginTop: 6 }}>{new Date(n.date).toLocaleString([], {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
              {!n.read && <span className="notification-dot" style={{ position: "absolute", top: 16, right: 16, width: 8, height: 8, background: LIME, borderRadius: "50%" }} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}