import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK, EMERALD } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';
import localforage from 'localforage';
import { uploadImageToStorage } from '../firebase';
import axios from 'axios';
import { getFunctions, httpsCallable } from "firebase/functions";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; 
export default
  function ScanIdScreen({ navigate, state, setState }) {
  const [uploads, setUploads] = useState(state.user?.uploads || { idFront: null, idBack: null, faceScan: null, selfie: null });
  const [updatedFields, setUpdatedFields] = useState({});
  const initialStep = parseInt(sessionStorage.getItem('scanId_step') || '0');
  const [wizardStep, setWizardStep] = useState(initialStep);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const steps = [
    { key: 'idFront', label: 'ID Front', Icon: Icons.IdCardIcon, desc: "Place your National ID inside the frame." },
    { key: 'idBack', label: 'ID Back', Icon: Icons.IdCardIcon, desc: "Flip your ID and capture the back." },
    { key: 'faceScan', label: 'Face Scan', Icon: Icons.UserIcon, desc: "Position your face in the center and hold still." },
    { key: 'selfie', label: 'Selfie with ID', Icon: Icons.SmartphoneIcon, desc: "Take a picture holding your ID next to your face." }
  ];
// دالة مساعدة لتحويل الصور
  const dataURLtoBlob = (dataurl) => {
    if (!dataurl) return null;
    try {
      let arr = dataurl.split(','),
          mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]),
          n = bstr.length,
          u8arr = new Uint8Array(n);
      while(n--){ u8arr[n] = bstr.charCodeAt(n); }
      return new Blob([u8arr], { type: mime });
    } catch (e) {
      console.error("Error converting dataURL to Blob:", e);
      return null;
    }
  };
  useEffect(() => {
    sessionStorage.removeItem('scanId_step');
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraStream]);

  function openCamera() {
    setCameraError("");
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(str => {
        setCameraStream(str);
      })
      .catch(err => {
        console.error(err);
        setCameraError("Please allow camera access to verify your ID.");
      });
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
  }

  function compressImage(imgSrc, callback) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 600;
      const MAX_HEIGHT = 600;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) { height = Math.round((height *= MAX_WIDTH / width)); width = MAX_WIDTH; }
      } else {
        if (height > MAX_HEIGHT) { width = Math.round((width *= MAX_HEIGHT / height)); height = MAX_HEIGHT; }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.src = imgSrc;
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    compressImage(dataUrl, (compressedUrl) => {
      const key = steps[wizardStep].key;
      setUploads(u => ({ ...u, [key]: compressedUrl }));
      setUpdatedFields(u => ({ ...u, [key]: true }));
      stopCamera();
    });
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        compressImage(ev.target.result, (compressedUrl) => {
          const key = steps[wizardStep].key;
          setUploads(u => ({ ...u, [key]: compressedUrl }));
          setUpdatedFields(u => ({ ...u, [key]: true }));
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
  }

  // async function handleSubmitVerification() {
  //   setLoading(true);
  //   const newUser = {
  //     id: `U-${Date.now()}`,
  //     email: state.user.email,
  //     name: state.user.name,
  //     first: state.user.first,
  //     last: state.user.last,
  //     phone: state.user.phone,
  //     nid: state.user.nid,
  //     password: state.user.password,
  //     role: state.user.role || 'user',
  //     status: 'pending',
  //     registeredAt: new Date().toISOString(),
  //     rides: 0,
  //     balance: 0,
  //     uploads: {
  //       idFront: uploads.idFront,
  //       idBack: uploads.idBack,
  //       faceScan: uploads.faceScan,
  //       selfie: uploads.selfie
  //     },
  //     updatedFields: {
  //       ...(state.user.updatedFields || {}),
  //       ...updatedFields
  //     }
  //   };

  //   try {
  //     const appUsers = await localforage.getItem('app_users') || [];
  //     const userIndex = appUsers.findIndex(u => u.phone === newUser.phone);
  //     if (userIndex > -1) {
  //       appUsers[userIndex] = { ...appUsers[userIndex], ...newUser };
  //     } else {
  //       appUsers.push(newUser);
  //     }
  //     await localforage.setItem('app_users', appUsers);
  //   } catch (err) {
  //     console.error("Save error:", err);
  //   }

  //   setState(s => ({
  //     ...s,
  //     user: {
  //       ...s.user,
  //       uploads,
  //       status: 'pending',
  //       correctionReason: ''
  //     }
  //   }));
  //   navigate("scanComplete");
  // }
  // واستبدلي دالة handleSubmitVerification بالدالة دي:
////////
// async function handleSubmitVerification() {
//   setLoading(true);
//   try {
//     const formData = new FormData();
//     formData.append('idFront', dataURLtoBlob(uploads.idFront), 'idFront.jpg');
//     formData.append('idBack', dataURLtoBlob(uploads.idBack), 'idBack.jpg');
//     formData.append('faceScan', dataURLtoBlob(uploads.faceScan), 'faceScan.jpg');
//     formData.append('selfie', dataURLtoBlob(uploads.selfie), 'selfie.jpg');
//     formData.append('nid', state.user.nid);
//     formData.append('uid', state.user.uid);
    

//     const response = await axios.post('http://localhost:5000/verify', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });

//     // تجهيز النتيجة
//     const verResult = { match: response.data.match, reason: response.data.reason };
    
//     // حفظ النتيجة في الـ SessionStorage لتنتقل للصفحة التالية
//     sessionStorage.setItem("verificationResult", JSON.stringify(verResult));

//     if (response.data.match === true) {
//       const newUser = { ...state.user, uploads, status: 'verified', correctionReason: '' };
//       await localforage.setItem('app_users', [newUser]);
//       setState(s => ({ ...s, user: newUser }));
//       navigate("scanComplete"); // تم الاستغناء عن الـ state الممرر
//     } else {
//       navigate("scanComplete");
//     }
//   } catch (err) {
//     console.error("Verification error:", err);
//     const errorMessage = err.response?.data?.reason || "Server error, check Flask server!";
//     // حفظ حالة الفشل أيضاً
//     sessionStorage.setItem("verificationResult", JSON.stringify({ match: false, reason: errorMessage }));
//     navigate("scanComplete");
//   } finally {
//     setLoading(false);
//   }
// }
//////
async function handleSubmitVerification() {
  setLoading(true);
  try {
    // 1. تحديث الـ State المحلي بالصور النهائية قبل الانتقال
    const newUserWithUploads = { 
      ...state.user, 
      uploads: uploads 
    };
    
    setState(s => ({ ...s, user: newUserWithUploads }));

    // 2. تحديث Firestore بالصور فقط (اختياري لو عايزة الأدمن يشوف الصور حتى لو السيرفر لسه مخلصش)
    const userRef = doc(db, "users", state.user.uid);
    await updateDoc(userRef, {
      uploads: uploads
    });

    // 3. الانتقال فوراً لصفحة الإتمام مع تمرير الصور في الـ navigation state
    // بعتنا الصور معانا عشان صفحة الـ ScanComplete تقدر تقرأها وتبدأ الـ Request
    navigate("scanComplete", { 
      state: { 
        startVerification: true,
        pendingUploads: uploads 
      } 
    });

  } catch (err) {
    console.error("Error updating local state:", err);
    // لو حصل مشكلة في تحديث الـ Firebase البسيط، بنوديه برضه للصفحة وهي هتعالج الخطأ
    navigate("scanComplete");
  } finally {
    setLoading(false);
  }
}
  const currentStepData = steps[wizardStep];
  const currentUpload = uploads[currentStepData.key];
  const IconEl = currentStepData.Icon;

  return (
    <div style={{ minHeight: "100%", background: "white", display: "flex", flexDirection: "column" }}>
      <StatusBar />

      {/* CAMERA OVERLAY */}
      {cameraStream && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm aspect-[3/4] bg-black rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
            <div className="absolute top-8 left-0 right-0 text-center text-white/50 text-sm font-bold uppercase tracking-widest pointer-events-none">{currentStepData.label}</div>
          </div>
          {cameraError && <div className="text-red-500 font-bold mt-4 px-6 text-center text-sm">{cameraError}</div>}
          <div className="flex gap-4 mt-8 w-full max-w-sm">
            <button className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all" onClick={stopCamera}>
              Cancel
            </button>
            <button className="flex-1 py-4 bg-[#CCFF00] text-[#111] font-bold rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all" onClick={capturePhoto}>
              <Icons.CameraIcon size={20} color="currentColor" /> Capture
            </button>
          </div>
        </div>
      )}

      {/* HIDDEN FILE UPLOAD */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div style={{ padding: "8px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
        <BackBtn onBack={() => wizardStep > 0 ? setWizardStep(wizardStep - 1) : navigate("register")} />

        <div style={{ marginTop: 16, marginBottom: 24 }}>
          <div className="page-title">{currentStepData.label}</div>
          <p className="page-subtitle" style={{ fontSize: 13, lineHeight: 1.4, color: "#666", marginBottom: state.user.status === 'needs_correction' ? 16 : 0 }}>
            {state.user.status === 'needs_correction'
              ? "Update the requested documents below and resubmit your profile."
              : currentStepData.desc}
          </p>

          {state.user.status === 'needs_correction' && state.user.correctionReason && (
            <div style={{ background: "#fff3cd", border: "1px solid #ffe69c", padding: 12, borderRadius: 8, marginTop: 8 }}>
              <div style={{ fontWeight: 700, color: "#ff6b35", fontSize: 12, marginBottom: 4, display: "flex", alignItems: "center", gap: 6, textTransform: 'uppercase' }}>
                <Icons.AlertTriangleIcon size={14} color="#ff6b35" /> Admin Feedback
              </div>
              <div style={{ color: "#555", fontSize: 13, fontWeight: 500 }}>{state.user.correctionReason}</div>
            </div>
          )}
        </div>

        {/* WIZARD PROGRESS TRACKER */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= wizardStep ? EMERALD : "#eee", transition: "background 0.3s" }} />
          ))}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 260, aspectRatio: "1/1", borderRadius: 24, background: currentUpload ? '#e8f5e9' : '#f9f9f9', display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: `2px dashed ${currentUpload ? EMERALD : '#ddd'}`, marginBottom: 32, position: "relative" }}>
            {currentUpload ? (
              <>
                <img src={currentUpload} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: 'absolute', top: 12, right: 12, background: EMERALD, color: "white", borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: "0 4px 12px rgba(46,125,50,0.3)" }}>
                  <Icons.CheckIcon size={18} color="white" />
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "#aaa" }}>
                <IconEl size={56} color="currentColor" />
                <span style={{ fontSize: 14, fontWeight: 600 }}>No Photo Captured</span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 16, width: "100%" }}>
            <button
              onClick={openCamera}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: DARK, color: "white", padding: "16px 0", borderRadius: 16, fontWeight: 700, cursor: "pointer", border: "none" }}>
              <Icons.CameraIcon size={20} color="white" /> Take Photo
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#f0f0f0", color: DARK, padding: "16px 0", borderRadius: 16, fontWeight: 700, cursor: "pointer", border: "none" }}>
              <Icons.SmartphoneIcon size={20} color={DARK} /> Upload
            </button>
          </div>
        </div>

        <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
          {wizardStep > 0 && (
            <button
              style={{ background: "white", color: DARK, border: "2px solid #ddd", padding: "16px", borderRadius: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              onClick={() => setWizardStep(wizardStep - 1)}>
              <Icons.ArrowLeftIcon size={20} color={DARK} />
            </button>
          )}
          <button
            style={{
              flex: 1,
              background: (loading || !currentUpload) ? "#eee" : LIME,
              color: (loading || !currentUpload) ? "#aaa" : DARK,
              border: "none",
              padding: "16px",
              borderRadius: 16,
              fontWeight: 800,
              fontSize: 16,
              cursor: (loading || !currentUpload) ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
            disabled={loading || !currentUpload}
            onClick={() => {
              if (wizardStep < 3) {
                setWizardStep(wizardStep + 1);
              } else {
                handleSubmitVerification();
              }
            }}
          >
            {loading 
              ? "Processing..." 
              : (wizardStep < 3 
                  ? "Next Step" 
                  : (state.user.status === 'needs_correction' ? 'Resubmit for Review' : 'Submit Verification')
                )
            }
          </button>
        </div>
      </div>
    </div>
  );
}