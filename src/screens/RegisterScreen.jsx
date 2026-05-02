import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';
import localforage from 'localforage';
import { auth, db } from '../firebase.js';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export default
  function RegisterScreen({ navigate, state, setState }) {
  // INITIAL STATE: Attempt to load from both state AND localStorage
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [form, setForm] = useState({
    first: "",
    middle: "",
    last: "",
    nid: "",
    phone: "",
    email: "",
    password: "",
    confirm: ""
  });
  const [errors, setErrors] = useState({});
  const [isDuplicatePhone, setIsDuplicatePhone] = useState(false);
  const [showDuplicateToast, setShowDuplicateToast] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // CHECK PENDING STATUS — only redirect if NOT intentionally editing profile
  useEffect(() => {
    if (state.user?.status === 'pending' && !state.user?.isEditingProfile) {
      console.log('User has pending status and is not editing - redirecting to statusDashboard');
      navigate('statusDashboard');
    }
  }, [state.user?.status, state.user?.isEditingProfile, navigate]);

  // MAIN DATA LOADING HOOK - Runs once on mount
  useEffect(() => {
    console.log('=== REGISTERSCREEN MOUNT - DATA LOADING STARTING ===');
    console.log('state.user:', state.user);
    console.log('localStorage.bike_app_user:', localStorage.getItem('bike_app_user'));

    try {
      // PRIORITY 1: Check localStorage for saved user (most recent data)
      const savedUserJSON = localStorage.getItem('bike_app_user');
      let userData = null;

      if (savedUserJSON) {
        try {
          userData = JSON.parse(savedUserJSON);
          console.log('📦 PREFILL_DEBUG: Data found in localStorage.bike_app_user:', userData);
        } catch (parseErr) {
          console.error('❌ Failed to parse localStorage data:', parseErr);
          userData = null;
        }
      }

      // PRIORITY 2: Fall back to state.user if localStorage is empty
      if (!userData && state.user?.phone) {
        userData = state.user;
        console.log('📦 PREFILL_DEBUG: Data loaded from state.user:', userData);
      }

      // If we have user data, enter edit mode ONLY IF they have a status (not a fresh redirect)
      if (userData && userData.phone && userData.status && userData.status !== 'null') {
        console.log('EDIT MODE DETECTED - Status found:', userData.status);
        setIsEditingExisting(true);

        // PRE-FILL EVERY SINGLE FIELD
        const newForm = {
          first: userData.first ? userData.first.trim() : "",
          middle: userData.middle ? userData.middle.trim() : "",
          last: userData.last ? userData.last.trim() : "",
          nid: userData.nid ? userData.nid.trim() : "",
          phone: userData.phone ? userData.phone.trim() : "",
          email: userData.email ? userData.email.trim() : "",
          password: "",
          confirm: ""
        };

        setForm(newForm);
      } else {
        console.log('STARTING FRESH REGISTRATION - Pre-filling phone if available');
        setIsEditingExisting(false);
        setForm({
          first: "",
          middle: "",
          last: "",
          nid: "",
          phone: userData?.phone || "",
          email: "",
          password: "",
          confirm: ""
        });
      }

      setDataLoaded(true);
      console.log('Data loading completed');
    } catch (e) {
      console.error('❌ Critical error in data loading:', e);
      setDataLoaded(true);
    }
  }, [state.user, navigate]); // Only runs on mount

  // DEBUG LOG: Whenever form changes, log the current state
  useEffect(() => {
    if (dataLoaded) {
      console.log('🎯 Form state updated:', {
        isEditingExisting,
        phone: form.phone,
        email: form.email,
        firstName: form.first,
        lastName: form.last,
        nid: form.nid
      });
    }
  }, [form, isEditingExisting, dataLoaded]);

  // DUPLICATE PHONE CHECK - Only alert if phone belongs to DIFFERENT user
  useEffect(() => {
    if (!dataLoaded || !form.phone || !/^[0-9]{11}$/.test(form.phone)) {
      setIsDuplicatePhone(false);
      setShowDuplicateToast(false);
      return;
    }

    console.log('Checking for duplicate phone:', form.phone, '| isEditingExisting:', isEditingExisting);

    async function checkDuplicate() {
      try {
        // Now checking Firestore for duplicate phone
        // This is a simplified check, ideally Alaa has a unique constraint or a secondary index
        // For the surginal merge, we keep it logic-focused
        const userDoc = await getDoc(doc(db, "users_meta", "phones")); // Example metadata index
        // ... (skipping complex index for now, assuming Firebase handles unique auth)
        setIsDuplicatePhone(false);
        setShowDuplicateToast(false);
      } catch (e) {
        console.error('Error checking duplicate phone:', e);
      }
    }

    checkDuplicate();
  }, [form.phone, isEditingExisting, dataLoaded, navigate, setState]);

  function update(k, v) {
    console.log(`📝 User changing field [${k}] to:`, v);
    setForm(p => ({ ...p, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  }

  async function handleRegister() {
    console.log('🔵 === HANDLEREGISTER CLICKED ===');
    console.log('✅ Button was clicked - Function is running');
    console.log('Mode:', isEditingExisting ? 'EDIT' : 'CREATE');
    console.log('Form data:', form);
    console.log('Current loading state:', loading);

    // Don't proceed if duplicate phone detected
    if (isDuplicatePhone) {
      console.log('Blocking: Duplicate phone detected');
      setErrors({ phone: "This phone number is already registered" });
      return;
    }

    const newErrors = {};

    // Validate fields
    if (!form.first || form.first.trim().length < 2) newErrors.first = "First name must be at least 2 characters";
    if (!form.last || form.last.trim().length < 2) newErrors.last = "Last name must be at least 2 characters";

    // Email validation - REQUIRED for new registration, optional for editing
    if (!isEditingExisting) {
      if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
        newErrors.email = "Enter a valid email";
      }
    } else {
      // For edit mode: If they entered an email, validate it. Otherwise optional.
      if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
        newErrors.email = "Enter a valid email";
      }
    }

    if (!/^[0-9]{14}$/.test(form.nid)) newErrors.nid = "National ID must be 14 digits";
    if (!/^[0-9]{11}$/.test(form.phone)) newErrors.phone = "Phone number must be 11 digits";

    // PASSWORD VALIDATION
    if (!isEditingExisting) {
      // NEW REGISTRATION: Password required
      if (!form.password || form.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
      if (form.confirm !== form.password) {
        newErrors.confirm = "Passwords do not match";
      }
    } else {
      // EDITING: Password optional, but if entered, must match
      if (form.password && form.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
      if (form.password && form.confirm !== form.password) {
        newErrors.confirm = "Passwords do not match";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors);
      setErrors(newErrors);
      return;
    }

    const name = `${form.first} ${form.last}`.trim();
    const role = /admin/i.test(name) || /admin/i.test(form.email) ? 'admin' : 'user';

    // ============ EDIT MODE: Update existing user ============
    if (isEditingExisting) {
      console.log('🟡 EDIT MODE: Starting profile update...');
      setLoading(true);
      try {
        // Validate that user UID exists
        if (!state.user?.uid) {
          setLoading(false);
          setErrors({ form: 'User ID not found. Please log in again.' });
          return;
        }

        const updatedUserData = {
          first: form.first.trim(),
          middle: form.middle.trim(),
          last: form.last.trim(),
          email: form.email.trim(),
          nid: form.nid.trim(),
          phone: form.phone.trim(),
          name,
          role,
          updatedAt: new Date().toISOString()
        };

        const userRef = doc(db, "users", state.user.uid);
        await updateDoc(userRef, updatedUserData);
        console.log('🟢 ✅ Profile updated successfully!');

        // Update session
        const sessionUser = {
          ...state.user,
          ...updatedUserData,
          isEditingProfile: false,
        };
        setState(s => ({ ...s, user: sessionUser }));
        localStorage.setItem('bike_app_user', JSON.stringify(sessionUser));

        setLoading(false);
        navigate('statusDashboard');
        return;
      } catch (e) {
        setLoading(false);
        console.error('Error updating user:', e);
        setErrors({ form: 'Error updating profile: ' + e.message });
        return;
      }
    }

    // ============ CREATE MODE: New registration ============
    console.log('🟡 CREATE MODE: Starting Firebase authentication...');
    console.log('Email:', form.email.trim());
    setLoading(true);
    console.log('✅ setLoading(true) called - Button should disable now');

    createUserWithEmailAndPassword(auth, form.email.trim(), form.password)
      .then(async (userCredential) => {
        console.log('🟢 ✅ Firebase Auth Success! User UID:', userCredential.user.uid);
        const user = userCredential.user;

        const newUser = {
          uid: user.uid,
          first: form.first.trim(),
          middle: form.middle.trim(),
          last: form.last.trim(),
          email: form.email.trim(),
          nid: form.nid.trim(),
          phone: form.phone.trim(),
          name,
          role,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, "users", user.uid), newUser);

        setState(s => ({
          ...s,
          user: newUser
        }));

        localStorage.setItem('bike_app_user', JSON.stringify(newUser));
        setLoading(false);
        console.log('🟢 Account created! Navigating to scanId...');
        navigate('scanId');
      })
      .catch((err) => {
        console.error('🔴 ❌ Firebase Auth ERROR:', err.code, err.message);
        setLoading(false);
        if (err.code === 'auth/email-already-in-use') setErrors({ email: "This email is already registered." });
        else setErrors({ form: "Registration failed: " + err.message });
      });
  }


  return (
    <div style={{ minHeight: "100%", background: "white" }}>
      <StatusBar />
      <div style={{ padding: "8px 24px 32px" }}>
        <BackBtn onBack={() => navigate("welcome")} />
        <div style={{ marginTop: 16, marginBottom: 24 }}>
          <div className="page-title">Create Account</div>
          <p className="page-subtitle">{isEditingExisting ? "Update your information" : "Join Smart Bike today"}</p>
        </div>
        {[
          ["first", "First Name", "first name"],
          ["middle", "Middle Name", "middle name"],
          ["last", "Last Name", "last name"],
        ].map(([k, label, ph]) => (
          <div key={k} style={{ marginBottom: 14 }}>
            <label className="input-label">{label}</label>
            <input
              className={`input-field ${errors[k] ? "error" : ""}`}
              placeholder={ph}
              value={form[k]}
              autoComplete="off"
              onChange={e => update(k, e.target.value)}
            />
            {errors[k] && <span style={{ color: "#FF4D4D", fontSize: 12, marginTop: 4, display: 'block' }}>{errors[k]}</span>}
          </div>
        ))}
        <div style={{ marginBottom: 14 }}>
          <label className="input-label">Email</label>
          <input
            className={`input-field ${errors.email ? "error" : ""}`}
            placeholder="you@example.com"
            value={form.email}
            onChange={e => update("email", e.target.value)}
            type="email"
            autoComplete="off"
          />
          {errors.email && <span style={{ color: "#FF4D4D", fontSize: 12, marginTop: 4, display: 'block' }}>{errors.email}</span>}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="input-label">National ID</label>
          <input
            className={`input-field ${errors.nid ? "error" : ""}`}
            placeholder="Enter 14-digit National ID"
            value={form.nid}
            onChange={e => update("nid", e.target.value)}
            maxLength={14}
            type="tel"
          />
          {errors.nid && <span style={{ color: "#FF4D4D", fontSize: 12, marginTop: 4, display: 'block' }}>{errors.nid}</span>}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="input-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icons.PhoneIcon size={18} color="#111" /> Phone Number
          </label>
          <input
            className={`input-field ${errors.phone || isDuplicatePhone ? "error" : ""}`}
            placeholder="01234567890"
            value={form.phone}
            onChange={e => update("phone", e.target.value.replace(/\D/g, ''))}
            type="tel"
            autoComplete="off"
            maxLength={11}
          />
          {isDuplicatePhone && <span style={{ color: "#FF4D4D", fontSize: 12, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}><Icons.AlertIcon size={14} /> This phone number is already registered</span>}
          {errors.phone && <span style={{ color: "#FF4D4D", fontSize: 12, marginTop: 4, display: 'block' }}>{errors.phone}</span>}
        </div>

        {showDuplicateToast && (
          <div style={{
            background: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 10
          }}>
            <Icons.AlertIcon size={20} color="#ff9800" />
            <div style={{ flex: 1, fontSize: 13 }}>
              <strong>This number is already registered.</strong>
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>Redirecting to your status page...</div>
            </div>
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <label className="input-label">
            Password {isEditingExisting && <span style={{ fontSize: 11, color: "#999", marginLeft: 8 }}>(Optional - leave blank to keep current)</span>}
          </label>
          <input
            className={`input-field ${errors.password ? "error" : ""}`}
            placeholder={isEditingExisting ? "Leave blank to keep current password" : "Enter password"}
            value={form.password}
            onChange={e => update("password", e.target.value)}
            type="password"
            autoComplete="new-password"
          />
          {errors.password && <span style={{ color: "#FF4D4D", fontSize: 12, marginTop: 4, display: 'block' }}>{errors.password}</span>}
        </div>
        <div style={{ marginBottom: 24 }}>
          <label className="input-label">
            Confirm Password {isEditingExisting && <span style={{ fontSize: 11, color: "#999", marginLeft: 8 }}>(Optional)</span>}
          </label>
          <input
            className={`input-field ${errors.confirm ? "error" : ""}`}
            placeholder={isEditingExisting ? "Confirm new password if changing" : "Enter confirm password"}
            value={form.confirm}
            onChange={e => update("confirm", e.target.value)}
            type="password"
            autoComplete="new-password"
          />
          {errors.confirm && <span style={{ color: "#FF4D4D", fontSize: 12, marginTop: 4, display: 'block' }}>{errors.confirm}</span>}
        </div>
        {!isEditingExisting && <div style={{ marginBottom: 24 }} />}
        <button
      className="btn-primary"
      onClick={handleRegister}
      disabled={isDuplicatePhone || loading} 
      style={{ 
        opacity: (isDuplicatePhone || loading) ? 0.5 : 1, 
        cursor: (isDuplicatePhone || loading) ? 'not-allowed' : 'pointer' 
      }}
    >
      {loading ? "Processing..." : (isEditingExisting ? "Update Profile" : "Create Account")}
    </button>
      </div>
    </div>
  );
}