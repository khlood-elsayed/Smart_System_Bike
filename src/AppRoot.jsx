// import React, { useState, useEffect } from "react";
// import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// import App from "./SmartBikeApp.jsx";
// import AdminApp from "./admin/AdminApp.jsx";
// import { DAMIETTA_BIKES } from './features/telemetry/geofence';
// import localforage from 'localforage';
// import { auth, db } from './firebase.js';
// import { onAuthStateChanged } from 'firebase/auth';
// import { doc, getDoc, onSnapshot, collection, setDoc, getDocs, query, where, limit } from 'firebase/firestore';

// export default function AppRoot() {
//   const location = useLocation();
//   const [booting, setBooting] = useState(true);
//   const [state, setState] = useState({
//     selectedBike: null,
//     otpMethod: "sms",
//     user: { name: "", email: "", profilePic: "", role: "", phone: "", first: "", last: "", status: null, rideHistory: [], startDockName: null },
//     bikes: [],
//     docks: [],
//     users: [],
//     isAdminMode: false
//   });

//   const DEFAULT_DOCKS = [
//     { id: "DOCK-DU-01", name: "Damietta University", lat: 31.4398, lng: 31.6705, occupiedBy: "B-LOCAL", servoPos: 170, voltage: 4.2, capacity: 10, lcdMessage: "Welcome!" },
//     { id: "DOCK-CP-02", name: "Central Park Hub", lat: 31.4285, lng: 31.6750, occupiedBy: null, servoPos: 170, voltage: 4.2, capacity: 10, lcdMessage: "Ready to ride" },
//     { id: "DOCK-BA-03", name: "New Damietta Beach", lat: 31.4550, lng: 31.6620, occupiedBy: null, servoPos: 170, voltage: 3.1, capacity: 10, lcdMessage: "Solar charging..." }
//   ];

//   const [screen, setScreen] = useState('splash');

//   // BOOTING & INITIALIZATION: Run exactly once on mount
//   useEffect(() => {
//     async function seedInitialData() {
//       try {
//         const bikesSnap = await getDocs(collection(db, "bikes"));
//         if (bikesSnap.empty) {
//           console.log("Seeding initial bikes to Firestore...");
//           for (const b of DAMIETTA_BIKES) {
//             await setDoc(doc(db, "bikes", b.id), { ...b, locked: b.status === 'Locked', voltage: 4.2 });
//           }
//         }
        
//         const docksSnap = await getDocs(collection(db, "docks"));
//         if (docksSnap.empty) {
//           console.log("Seeding initial docks to Firestore...");
//           for (const d of DEFAULT_DOCKS) {
//             await setDoc(doc(db, "docks", d.id), d);
//           }
//         }
//       } catch (err) {
//         console.error("Seeding failed:", err);
//       }
//     }

//     async function boot() {
//       console.log("=== APPROOT BOOTING STARTING (FIREBASE) ===");
//       await seedInitialData();
      
//       onAuthStateChanged(auth, async (fbUser) => {
//         if (fbUser) {
//           console.log("Firebase Auth detected user:", fbUser.uid);
          
//           // 1. Fetch Profile from Firestore by UID
//           let userDoc = await getDoc(doc(db, "users", fbUser.uid));
//           let userData = null;

//           if (userDoc.exists()) {
//             userData = userDoc.data();
//             console.log("Found user profile by UID:", userData);
//           } else {
//             console.warn("User document not found by UID. Checking for legacy record (email/phone)...");
//             // FALLBACK: Search by email if UID doc doesn't exist (Legacy users indexed by phone)
//             try {
//               const q = query(collection(db, "users"), where("email", "==", fbUser.email), limit(1));
//               const snap = await getDocs(q);
//               if (!snap.empty) {
//                 const legacyDoc = snap.docs[0];
//                 userData = { ...legacyDoc.data(), uid: fbUser.uid };
//                 console.log("MIGRATION: Found legacy record by email. Re-indexing...", userData);
                
//                 // Perform Migration: Save under UID to avoid future queries
//                 await setDoc(doc(db, "users", fbUser.uid), userData);
//                 console.log("MIGRATION SUCCESS: Record now indexed by UID.");
//               }
//             } catch (err) {
//               console.error("Migration check failed:", err);
//             }
//           }

//           // If STILL not found, initialize new user state
//           if (!userData) {
//             userData = { uid: fbUser.uid, email: fbUser.email, status: 'pending' };
//           }

//           // 2. Determine Screen
//           const path = window.location.pathname;
//           const isAdminPath = path.startsWith('/admin');
//           const isAdminMode = localStorage.getItem('admin_mode') === 'true';
//           let initialScreen = 'map';

//           const status = (userData.status || "").toUpperCase();
//           if (isAdminMode || isAdminPath) initialScreen = 'adminDashboard';
//           else if (status === 'VERIFIED') initialScreen = userData.phoneVerified ? 'map' : 'otp';
//           else if (status === 'PENDING') initialScreen = 'ScanCompleteScreen';
//           else if (status === 'NEED_CORRECTION' || status === 'NEEDS_CORRECTION') initialScreen = 'needCorrection';
//           else if (status === 'REJECTED') initialScreen = 'login';
//           else initialScreen = 'scanId';

//           setState(s => ({ ...s, user: userData, isAdminMode: isAdminMode || isAdminPath }));
//           setScreen(initialScreen);
//           setBooting(false);
//         } else {
//           console.log("No Firebase user found - showing splash/login");
//           setScreen(window.location.pathname === '/' ? 'splash' : 'login');
//           setBooting(false);
//         }
//       });
//     }
//     boot();
//   }, []);

//   // Sync Bikes & Docks from Firestore
//   useEffect(() => {
//     const unsubBikes = onSnapshot(collection(db, "bikes"), (snap) => {
//       // FOR TESTING: Only show the physical IoT test bike
//       const bikesArr = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(b => b.id === 'B-LOCAL');
//       setState(s => ({ ...s, bikes: bikesArr }));
//     });
//     const unsubDocks = onSnapshot(collection(db, "docks"), (snap) => {
//       // FOR TESTING: Only show the physical IoT test dock
//       const docksArr = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.id === 'DOCK-DU-01').map(d => ({ ...d, name: 'IOT Hardware Dock' }));
//       setState(s => ({ ...s, docks: docksArr }));
//     });
    
//     // Also sync all users if in admin mode
//     let unsubUsers = () => {};
//     if (state.isAdminMode) {
//       unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
//         const usersArr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
//         setState(s => ({ ...s, users: usersArr }));
//       });
//     }

//     return () => { unsubBikes(); unsubDocks(); unsubUsers(); };
//   }, [state.isAdminMode]);

//   // Real-time Status Sync via Firestore onSnapshot
//   useEffect(() => {
//     if (booting || state.isAdminMode || !state.user?.uid) return;

//     console.log("Setting up real-time status sync for UID:", state.user.uid);
//     const unsubscribe = onSnapshot(doc(db, "users", state.user.uid), (docSnap) => {
//       if (docSnap.exists()) {
//         const liveUser = docSnap.data();
//         if (liveUser.status !== state.user.status) {
//           console.log("STATUS CHANGE DETECTED (Firestore):", state.user.status, "->", liveUser.status);
//           const updatedUser = { ...state.user, ...liveUser };
//           setState(s => ({ ...s, user: updatedUser }));
//           localStorage.setItem('bike_app_user', JSON.stringify(updatedUser));
          
//           if (liveUser.status === 'verified' && !state.isAdminMode) {
//             setScreen('map');
//           } else if (liveUser.status === 'needs_correction' && !state.isAdminMode) {
//              setScreen('statusDashboard');
//           }
//         }
//       }
//     });

//     return () => unsubscribe();
//   }, [state.user?.uid, booting, state.isAdminMode]);

//   // Persist user state to localStorage
//   useEffect(() => {
//     if (!booting && state.user && state.user.phone) {
//       localStorage.setItem('bike_app_user', JSON.stringify(state.user));
//     }
//   }, [state.user, booting]);

//   // Handle loading state: Spinner
//   if (booting) {
//     return (
//       <div style={{ minHeight: '100vh', background: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <div className="spinner"></div>
//       </div>
//     );
//   }

//   return (
//     <Routes>
//       <Route path="/admin/*" element={<AdminApp state={state} setState={setState} navigate={setScreen} />} />
//       <Route path="/*" element={<App state={state} setState={setState} screen={screen} setScreen={setScreen} />} />
//     </Routes>
//   );
// }
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import App from "./SmartBikeApp.jsx";
import AdminApp from "./admin/AdminApp.jsx";
import { DAMIETTA_BIKES } from './features/telemetry/geofence';
import localforage from 'localforage';
import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, collection, setDoc, getDocs, query, where, limit } from 'firebase/firestore';

export default function AppRoot() {
  const location = useLocation();
  const [booting, setBooting] = useState(true);
  const [state, setState] = useState({
    selectedBike: null,
    otpMethod: "sms",
    user: { name: "", email: "", profilePic: "", role: "", phone: "", first: "", last: "", status: null, rideHistory: [], startDockName: null },
    bikes: [],
    docks: [],
    users: [],
    isAdminMode: false
  });

  const DEFAULT_DOCKS = [
    { id: "DOCK-DU-01", name: "Damietta University", lat: 31.4398, lng: 31.6705, occupiedBy: "B-LOCAL", servoPos: 170, voltage: 4.2, capacity: 10, lcdMessage: "Welcome!" },
    { id: "DOCK-CP-02", name: "Central Park Hub", lat: 31.4285, lng: 31.6750, occupiedBy: null, servoPos: 170, voltage: 4.2, capacity: 10, lcdMessage: "Ready to ride" },
    { id: "DOCK-BA-03", name: "New Damietta Beach", lat: 31.4550, lng: 31.6620, occupiedBy: null, servoPos: 170, voltage: 3.1, capacity: 10, lcdMessage: "Solar charging..." }
  ];

  const [screen, setScreen] = useState('splash');

  // BOOTING & INITIALIZATION: Run exactly once on mount
  useEffect(() => {
    async function seedInitialData() {
      try {
        const bikesSnap = await getDocs(collection(db, "bikes"));
        if (bikesSnap.empty) {
          console.log("Seeding initial bikes to Firestore...");
          for (const b of DAMIETTA_BIKES) {
            await setDoc(doc(db, "bikes", b.id), { ...b, locked: b.status === 'Locked', voltage: 4.2 });
          }
        }
        
        const docksSnap = await getDocs(collection(db, "docks"));
        if (docksSnap.empty) {
          console.log("Seeding initial docks to Firestore...");
          for (const d of DEFAULT_DOCKS) {
            await setDoc(doc(db, "docks", d.id), d);
          }
        }
      } catch (err) {
        console.error("Seeding failed:", err);
      }
    }

    async function boot() {
      console.log("=== APPROOT BOOTING STARTING (FIREBASE) ===");
      await seedInitialData();
      
      onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          console.log("Firebase Auth detected user:", fbUser.uid);
          
          let userDoc = await getDoc(doc(db, "users", fbUser.uid));
          let userData = null;

          if (userDoc.exists()) {
            userData = userDoc.data();
            console.log("Found user profile by UID:", userData);
          } else {
            console.warn("User document not found by UID. Checking legacy...");
            try {
              const q = query(collection(db, "users"), where("email", "==", fbUser.email), limit(1));
              const snap = await getDocs(q);
              if (!snap.empty) {
                const legacyDoc = snap.docs[0];
                userData = { ...legacyDoc.data(), uid: fbUser.uid };
                await setDoc(doc(db, "users", fbUser.uid), userData);
                console.log("MIGRATION SUCCESS: Indexed by UID.");
              }
            } catch (err) {
              console.error("Migration check failed:", err);
            }
          }

          if (!userData) {
            userData = { uid: fbUser.uid, email: fbUser.email, status: 'pending' };
          }

          // --- التعديل هنا: تحديد الشاشة الابتدائية بدقة ---
          const path = window.location.pathname;
          const isAdminPath = path.startsWith('/admin');
          const userRole = (userData.role || "").toLowerCase();
          const status = (userData.status || "").toLowerCase();
          
          let initialScreen = 'splash';

          if (userRole === 'admin' || isAdminPath) {
            initialScreen = 'adminDashboard';
          } else {
            if (status === 'verified') {
              // لو تم التحقق، يروح للخريطة (أو الـ OTP لو لسه محققش الموبايل)
              initialScreen = userData.phoneVerified ? 'map' : 'otp';
            } else if (status === 'processing' || status === 'pending') {
              // لو لسه بيفحص أو باعت، يفضل في صفحة الانتظار/الفحص
              initialScreen = 'scanComplete'; 
            } else if (status === 'needs_correction' || status === 'need_correction') {
              initialScreen = 'needCorrection';
            } else if (status === 'rejected') {
              initialScreen = 'login';
            } else {
              initialScreen = 'scanId';
            }
          }

          setState(s => ({ ...s, user: userData, isAdminMode: (userRole === 'admin' || isAdminPath) }));
          setScreen(initialScreen);
          setBooting(false);
        } else {
          console.log("No Firebase user found - showing splash/login");
          setScreen(window.location.pathname === '/' ? 'splash' : 'login');
          setBooting(false);
        }
      });
    }
    boot();
  }, []);

  // Sync Bikes & Docks from Firestore
  useEffect(() => {
    const unsubBikes = onSnapshot(collection(db, "bikes"), (snap) => {
      const bikesArr = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(b => b.id === 'B-LOCAL');
      setState(s => ({ ...s, bikes: bikesArr }));
    });
    const unsubDocks = onSnapshot(collection(db, "docks"), (snap) => {
      const docksArr = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.id === 'DOCK-DU-01').map(d => ({ ...d, name: 'IOT Hardware Dock' }));
      setState(s => ({ ...s, docks: docksArr }));
    });
    
    let unsubUsers = () => {};
    if (state.isAdminMode) {
      unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
        const usersArr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setState(s => ({ ...s, users: usersArr }));
      });
    }

    return () => { unsubBikes(); unsubDocks(); unsubUsers(); };
  }, [state.isAdminMode]);

  // --- التعديل هنا: مراقبة الحالة لحظياً لنقل اليوزر للخريطة فور نجاح الـ AI ---
  useEffect(() => {
    if (booting || state.isAdminMode || !state.user?.uid) return;

    console.log("Setting up real-time status sync for UID:", state.user.uid);
    const unsubscribe = onSnapshot(doc(db, "users", state.user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const liveUser = docSnap.data();
        const currentStatus = (liveUser.status || "").toLowerCase();
        const prevStatus = (state.user.status || "").toLowerCase();

        if (currentStatus !== prevStatus) {
          console.log("STATUS CHANGE DETECTED:", prevStatus, "->", currentStatus);
          
          setState(s => ({ ...s, user: { ...s.user, ...liveUser } }));
          
          // الانتقال التلقائي بناءً على الحالة الجديدة
          if (currentStatus === 'verified') {
            console.log("Redirecting to MAP - Verification Success");
            setScreen('map');
          } else if (currentStatus === 'needs_correction') {
            setScreen('needCorrection');
          }
        }
      }
    });

    return () => unsubscribe();
  }, [state.user?.uid, booting, state.isAdminMode]);

  useEffect(() => {
    if (!booting && state.user && state.user.uid) {
      localStorage.setItem('bike_app_user', JSON.stringify(state.user));
    }
  }, [state.user, booting]);

  if (booting) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ border: '4px solid #fff', borderTop: '4px solid transparent', borderRadius: '50%', width: 40, height: 40, animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp state={state} setState={setState} navigate={setScreen} />} />
      <Route path="/*" element={<App state={state} setState={setState} screen={screen} setScreen={setScreen} />} />
    </Routes>
  );
}