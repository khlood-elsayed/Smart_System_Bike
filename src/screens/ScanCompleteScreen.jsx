import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; 
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import axios from 'axios';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

export default function ScanCompleteScreen({ navigate, state: globalState, setState: setGlobalState }) {
  const location = useLocation();
  const [status, setStatus] = useState("processing"); // processing | success | failed
  const [reason, setReason] = useState("");

  // دالة تحويل الصور من Base64 إلى Blob لإرسالها للسيرفر
  const dataURLtoBlob = (dataurl) => {
    try {
      let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while(n--) u8arr[n] = bstr.charCodeAt(n);
      return new Blob([u8arr], {type:mime});
    } catch (e) {
      console.error("Blob conversion error:", e);
      return null;
    }
  };

  useEffect(() => {
    const runVerification = async () => {
      // 1. استلام الصور من الـ Navigation State أو الـ Global State
      const uploads = location.state?.pendingUploads || globalState.user.uploads;

      if (!uploads) {
        setStatus("failed");
        setReason("No images found to process. Please go back.");
        return;
      }

      try {
        const formData = new FormData();
        formData.append('idFront', dataURLtoBlob(uploads.idFront), 'idFront.jpg');
        formData.append('idBack', dataURLtoBlob(uploads.idBack), 'idBack.jpg');
        formData.append('faceScan', dataURLtoBlob(uploads.faceScan), 'faceScan.jpg');
        formData.append('selfie', dataURLtoBlob(uploads.selfie), 'selfie.jpg');

        // 2. إرسال الطلب لسيرفر الـ AI (Flask)
        const response = await axios.post('http://localhost:5000/verify', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const isMatch = response.data.match;
        const serverReason = response.data.reason;
        const finalStatus = isMatch ? 'verified' : 'needs_correction';

        // 3. تحديث Firestore بالنتيجة فوراً
        const userRef = doc(db, "users", globalState.user.uid);
        const verResult = { 
          match: isMatch, 
          reason: serverReason, 
          date: new Date().toISOString() 
        };

        await updateDoc(userRef, {
          status: finalStatus,
          verificationResult: verResult
        });

        // 4. تحديث الحالة المحلية (Global State)
        const updatedUser = { 
          ...globalState.user, 
          status: finalStatus, 
          correctionReason: isMatch ? '' : serverReason 
        };
        setGlobalState(s => ({ ...s, user: updatedUser }));

        // 5. تحديث الواجهة بناءً على النتيجة
        if (isMatch) {
          setStatus("success");
          // ملحوظة: الـ AppRoot هينقلك للخريطة أوتوماتيك أول ما يحس بتغيير الـ status في الفايربيز
          // لو الـ AppRoot متأخر، السطر ده كضمان (اتأكدي إن الإسم 'map' صح في الـ Registry)
          setTimeout(() => navigate("map"), 2500); 
        } else {
          setStatus("failed");
          setReason(serverReason);
        }

      } catch (err) {
        console.error("Verification error:", err);
        setStatus("failed");
        setReason("Connection error with the server. Please try again later.");
      }
    };

    runVerification();
  }, []);

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "white", padding: 32 }}>
      
      {/* دائرة الحالة */}
      <div className="status-circle" style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: status === "success" ? LIME : status === "failed" ? "#ff4d4d" : "#f0f0f0",
        width: 100, height: 100, borderRadius: "50%",
        transition: "all 0.5s ease",
        marginBottom: 20
      }}>
        {status === "processing" && (
          <div className="loader" style={{ border: `4px solid ${DARK}`, borderTop: "4px solid transparent", borderRadius: "50%", width: 40, height: 40, animation: "spin 1s linear infinite" }}></div>
        )}
        {status === "success" && <Icons.CheckIcon size={50} color={DARK} />}
        {status === "failed" && <Icons.XIcon size={50} color="white" />}
      </div>

      <h2 style={{ fontSize: 26, fontWeight: 800, textAlign: "center", marginTop: 10 }}>
        {status === "processing" ? "Verifying Identity..." : 
         status === "success" ? "Success!" : "Action Required"}
      </h2>
      
      <p style={{ color: "#888", textAlign: "center", marginTop: 10, lineHeight: 1.5, maxWidth: 300 }}>
        {status === "processing" ? "Our AI is analyzing your documents. Please don't close the app." :
         status === "success" ? "Identity confirmed. We're getting your map ready..." : reason}
      </p>

      {/* أزرار التحكم في حالة الفشل فقط */}
      <div style={{ marginTop: 40, width: "100%" }}>
        {status === "failed" && (
          <button className="btn-primary" onClick={() => navigate("scanId")}>
            Try Again
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}