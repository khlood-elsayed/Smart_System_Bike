import React, { useState } from "react";
import { LIME, DARK, EMERALD } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';
import { auth, db } from '../firebase.js';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default
function LoginScreen({ navigate, state, setState }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRejectionMessage, setShowRejectionMessage] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // ── Shared post-login handler ──
  async function handleSuccessfulLogin(userCredential, cleanPhone, isAdminFlow = false) {
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {
      uid: user.uid,
      phone: cleanPhone,
      role: isAdminFlow ? 'admin' : 'user',
      status: isAdminFlow ? 'verified' : 'pending'
    };

    const status = (userData.status || "").toUpperCase();
    const role = (userData.role || "").toLowerCase();
    console.log('Firebase Login OK. UID:', user.uid, '| Status:', status, '| Role:', role, '| AdminFlow:', isAdminFlow);

    // ── If entered via admin email form OR Firestore says admin ──
    if (isAdminFlow || role === 'admin') {
      const adminUser = { ...userData, role: 'admin', uid: user.uid };
      setState(s => ({ ...s, user: adminUser, isAdminMode: true }));
      localStorage.setItem('bike_app_user', JSON.stringify(adminUser));
      localStorage.setItem('admin_mode', 'true');
      setLoading(false);
      navigate('adminDashboard');
      return;
    }

    setState(s => ({ ...s, user: userData, isAdminMode: false }));
    localStorage.setItem('bike_app_user', JSON.stringify(userData));
    localStorage.setItem('admin_mode', 'false');
    setLoading(false);

    if (status === 'VERIFIED') {
      navigate(userData.phoneVerified ? 'map' : 'otp');
    } else if (status === 'PENDING') {
      navigate('pendingApproval');
    } else if (status === 'NEED_CORRECTION' || status === 'NEEDS_CORRECTION') {
      navigate('needCorrection');
    } else if (status === 'REJECTED') {
      setShowRejectionMessage(true);
      setError("Your account was rejected. Please contact support.");
    } else {
      navigate('statusDashboard');
    }
  }

  // ── ADMIN: email login (step 2) ──
  async function handleAdminLogin() {
    const emailInput = phone.trim();
    const pwd = password.trim();
    if (!pwd) { setError("Please enter your password"); return; }

    setLoading(true);
    try {
      // Pass isAdminFlow = true so we always land on adminDashboard
      const cred = await signInWithEmailAndPassword(auth, emailInput, pwd);
      await handleSuccessfulLogin(cred, "", true);
    } catch (err) {
      setLoading(false);
      console.error("Admin Login Error:", err.code, err.message);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Wrong password. Please try again.");
      } else if (err.code === 'auth/user-not-found') {
        setError("No admin account found with this email.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email format.");
      } else {
        setError(`Login failed: ${err.code}`);
      }
    }
  }

  // ── USER: phone login ──
  async function handleUserLogin() {
    const input = phone.trim();
    const pwd = password.trim();

    if (!input) { setError("Please enter your phone number"); return; }
    if (!pwd) { setError("Please enter your password"); return; }

    const cleanPhone = input.replace(/\D/g, '');
    setLoading(true);
    setError("");

    // Attempt 1: phone@smartbike.com
    const directEmail = `${cleanPhone}@smartbike.com`;
    try {
      const cred = await signInWithEmailAndPassword(auth, directEmail, pwd);
      await handleSuccessfulLogin(cred, cleanPhone);
      return;
    } catch (err1) {
      // Attempt 2: find real email in Firestore by phone field
      try {
        const q = query(collection(db, "users"), where("phone", "==", cleanPhone));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const userData = snap.docs[0].data();
          const realEmail = userData.email;
          try {
            const cred2 = await signInWithEmailAndPassword(auth, realEmail, pwd);
            await handleSuccessfulLogin(cred2, cleanPhone);
            return;
          } catch (err2) {
            setLoading(false);
            if (err2.code === 'auth/wrong-password' || err2.code === 'auth/invalid-credential') {
              setError("Wrong password. Please try again.");
            } else {
              setError("Login failed: " + err2.message);
            }
          }
        } else {
          setLoading(false);
          setError("No account found with this phone number. Please register first.");
        }
      } catch (lookupErr) {
        setLoading(false);
        setError("Login failed. Check your connection.");
      }
    }
  }

  function handleLogin() {
    setError("");
    setShowRejectionMessage(false);
    const input = phone.trim();

    if (!input) {
      setError("Please enter your phone number or email");
      return;
    }

    if (input.includes("@")) {
      // If admin password step not shown yet → show it
      if (!showAdminPassword) {
        setShowAdminPassword(true);
        return;
      }
      // If admin password step is already showing → submit
      handleAdminLogin();
    } else {
      handleUserLogin();
    }
  }

  function handleRestartRegistration() {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    setState(s => ({
      ...s,
      user: { ...s.user, phone: cleanPhone, role: 'user', status: null, first: "", last: "", profilePic: "" }
    }));
    setShowRejectionMessage(false);
    setError("");
    navigate('register');
  }

  return (
    <div style={{ minHeight: "100%", background: "white" }}>
      <StatusBar />
      <div style={{ padding: "8px 24px 32px" }}>
        <BackBtn onBack={() => navigate("welcome")} />
        <div style={{ marginTop: 20, marginBottom: 24 }}>
          <div className="page-title">Log In</div>
          <p className="page-subtitle">
            {showAdminPassword ? "Enter your admin password" : "Enter your phone number to continue"}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* ── Phone / Email field ── */}
          <div>
            <label className="input-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {showAdminPassword
                ? <><Icons.MailIcon size={18} color="#111" /> Admin Email</>
                : <><Icons.PhoneIcon size={18} color="#111" /> Phone Number</>
              }
            </label>
            <input
              className={`input-field ${error && !phone ? "error" : ""}`}
              placeholder={showAdminPassword ? "admin@smartbike.com" : "Enter your phone number"}
              value={phone}
              onChange={e => { setPhone(e.target.value); setError(""); }}
              type="text"
              disabled={loading || showAdminPassword}
              autoComplete="off"
            />
          </div>

          {/* ── Password field (always shown) ── */}
          <div>
            <label className="input-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icons.LockIcon size={18} color="#111" /> Password
            </label>
            <input
              className={`input-field ${error && password ? "error" : ""}`}
              placeholder="Enter your password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              type="password"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{ color: "#FF3B30", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              <Icons.AlertIcon size={16} /> {error}
            </div>
          )}

          {showAdminPassword && (
            <button
              onClick={() => { setShowAdminPassword(false); setPassword(""); setError(""); }}
              style={{ background: "none", border: "none", color: EMERALD, cursor: "pointer", textDecoration: "underline", fontSize: 12, textAlign: 'left' }}
            >
              ← Back to Phone Login
            </button>
          )}

          {showRejectionMessage && (
            <div style={{ background: "#fee", border: "1px solid #f99", borderRadius: 8, padding: 12, marginTop: 8 }}>
              <div style={{ color: "#FF3B30", fontSize: 13, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Icons.AlertIcon size={18} /> Rejection Notification
              </div>
              <p style={{ color: "#666", fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>{error}</p>
              <button
                onClick={handleRestartRegistration}
                style={{ background: LIME, color: DARK, border: "none", borderRadius: 6, padding: "8px 12px", fontWeight: 600, cursor: "pointer", fontSize: 12, width: "100%" }}
              >
                Try Again
              </button>
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handleLogin}
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? "Checking..." : (showAdminPassword ? "Unlock Admin" : "Log In")}
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: 32, color: "#888", fontSize: 14 }}>
          Don't have an account?{" "}
          <span style={{ color: DARK, fontWeight: 700, cursor: "pointer" }} onClick={() => navigate("register")}>Create one</span>
        </p>
      </div>
    </div>
  );
}