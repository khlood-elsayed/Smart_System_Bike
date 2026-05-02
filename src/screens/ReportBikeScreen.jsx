import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function ReportBikeScreen({ navigate }) {
  const [submitted, setSubmitted] = useState(false);
  const [desc, setDesc] = useState("");

  return (
    <div style={{ minHeight: "100%", background: "white" }}>
      <StatusBar />
      <div style={{ padding: "8px 24px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <BackBtn onBack={() => navigate("reportIssue")} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div className="page-title">Report Bike Condition</div>
            <p className="page-subtitle">Help us fix the issue</p>
          </div>
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, fontFamily: "'Space Grotesk',sans-serif" }}>Step 1: Photo of Issue</div>
        <div style={{ background: "#f7f7f7", borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 20, cursor: "pointer" }}>
          <div style={{ width: 60, height: 60, background: LIME, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <Icons.CameraIcon size={28} color={DARK} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Take a photo of the issue</div>
          <div style={{ color: "#888", fontSize: 13, marginTop: 4, textAlign: "center" }}>Help us identify the problem</div>
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, fontFamily: "'Space Grotesk',sans-serif" }}>Step 2: Description (Optional)</div>
        <textarea
          className="input-field"
          style={{ minHeight: 120, resize: "none", borderRadius: 14 }}
          placeholder="Describe the issue in detail..."
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
        <div style={{ marginTop: 24 }}>
          <button className="btn-primary" onClick={() => setSubmitted(true)}>Submit Report</button>
        </div>
      </div>

      {submitted && (
        <div className="modal-overlay modal-overlay-center">
          <div className="modal-card">
            <div style={{ textAlign: "center" }}>
              <div className="success-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.CheckIcon size={40} color={DARK} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>Report Submitted!</div>
              <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>We will get in touch with you in 5 minutes</p>
              <button className="btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={() => navigate("map")}>
                <Icons.ArrowLeftIcon size={18} color="currentColor" /> Back To Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}