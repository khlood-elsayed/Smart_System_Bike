import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function LegalScreen({ navigate }) {
  return (
    <div style={{ minHeight: "100%", background: "white" }}>
      <StatusBar />
      <div style={{ padding: "8px 24px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <BackBtn onBack={() => navigate("settings")} />
          <div className="page-title">Legal Information</div>
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 12 }}>Terms Of Use</div>
        {[
          { icon: <Icons.ShieldCheckIcon size={18} color={DARK} />, title: "Safety Guidelines", body: "Your Safety Is Our Priority. Always Wear A Helmet (Strongly Recommended). Obey All Traffic Laws And Signals. Ride In Designated Bike Lanes When Available." },
          { icon: <Icons.CheckCircleIcon size={18} color={DARK} />, title: "User Responsibilities", body: "As A Smart Bike User, you Agree To: Use Bikes Properly And Safely At All Times. Return Bikes To Designated Stations Or Approved Parking Areas. Follow All Local Traffic Laws And Regulations. Report Any Damage Or Mechanical Issues Immediately." },
        ].map(s => (
          <div key={s.title} className="legal-section">
            <div className="legal-header">{s.icon} {s.title}</div>
            <div className="legal-body">{s.body}</div>
          </div>
        ))}
        <div style={{ fontWeight: 700, fontSize: 16, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 12, marginTop: 8 }}>Privacy Policy</div>
        {[
          { icon: <Icons.EyeIcon size={18} color={DARK} />, title: "How We Use Your Data", body: "Smart Bike Uses Your Data For: Processing And Completing Your Bike Rentals. Calculating Ride Costs And Processing Payments. Showing Your Ride History And Statistics. Locating Available Bikes Near You." },
          { icon: <Icons.LockIcon size={18} color={DARK} />, title: "Data Security", body: "Request A Copy Of All Data We Hold About You. Receive Your Data In A Portable Format. Review How Your Data Is Being Used." },
        ].map(s => (
          <div key={s.title} className="legal-section">
            <div className="legal-header">{s.icon} {s.title}</div>
            <div className="legal-body">{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}