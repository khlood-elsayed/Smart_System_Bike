import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function PhoneVerifiedScreen({ navigate, state, setState }) {
  useEffect(() => {
    // Route based on user status after phone verification
    const timer = setTimeout(() => {
      const userStatus = state.user?.status;

      if (userStatus === 'verified') {
        // Approved user goes to home map
        navigate('map');
      } else if (userStatus === 'pending') {
        // Pending user goes to status dashboard
        navigate('statusDashboard');
      } else {
        // New user goes to registration or scan ID
        navigate('register');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [state.user?.status, navigate]);

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "white", padding: 32 }}>
      <div className="success-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icons.CheckIcon size={40} color={DARK} />
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", textAlign: "center" }}>Congratulation!</h2>
      <p style={{ color: "#888", textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>Your Phone Number has been verified successfully.</p>
      <p style={{ color: "#999", textAlign: "center", marginTop: 16, fontSize: 12, lineHeight: 1.4 }}>
        {state.user?.status === 'verified' && 'Redirecting to your map...'}
        {state.user?.status === 'pending' && 'Checking your status...'}
        {!state.user?.status && 'Completing registration...'}
      </p>
    </div>
  );
}