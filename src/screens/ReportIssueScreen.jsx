import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function ReportIssueScreen({ navigate }) {
  return (
    <div style={{ minHeight: "100%", background: "white" }}>
      <StatusBar />
      <div style={{ padding: "8px 24px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <BackBtn onBack={() => navigate("map")} />
          <div className="page-title">Report Issue</div>
        </div>
        <p className="page-subtitle" style={{ marginBottom: 24 }}>Something Wrong With this bike?</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "#f7f7f7", borderRadius: 16, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => navigate("calling")}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, background: LIME, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icons.PhoneIcon size={20} color={DARK} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Contact Support</div>
                <div style={{ color: "#888", fontSize: 13 }}>Speak with our team immediately</div>
              </div>
            </div>
            <Icons.ChevronRightIcon size={18} color="#aaa" />
          </div>
          <div style={{ background: "#f7f7f7", borderRadius: 16, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => navigate("reportBike")}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, background: LIME, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icons.CameraIcon size={20} color={DARK} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Report Bike Condition</div>
                <div style={{ color: "#888", fontSize: 13 }}>Submit details of the issue</div>
              </div>
            </div>
            <Icons.ChevronRightIcon size={18} color="#aaa" />
          </div>
        </div>
      </div>
    </div>
  );
}