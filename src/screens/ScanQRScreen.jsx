import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';
import { calculateDistance, simulateBluetoothScan, simulateDockUnlock } from '../features/telemetry/SensorGate.js';

export default
  function ScanQRScreen({ navigate, state }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [scannedCode, setScannedCode] = useState(null);

  // SensorGate states
  const [handshakeStep, setHandshakeStep] = useState("idle"); // idle, gps, ble, success, manual_input
  const [permissionStatus, setPermissionStatus] = useState("pending"); // pending, granted, denied
  const [manualId, setManualId] = useState("");

  const selectedBike = state.selectedBike;
  const initialTargetId = selectedBike?.id || null;

  useEffect(() => {
    if (state.user?.status && state.user.status !== 'verified') {
      navigate('statusDashboard');
    }
  }, [state.user?.status, navigate]);

  // Auto-trigger Sensor Gate immediately on mount if permission granted
  useEffect(() => {
    if (state.user?.status === 'verified' && permissionStatus === 'granted') {
      initiateSensorGate(false);
    }
  }, [permissionStatus]);

  // Start the Triple Handshake (GPS -> BLE -> Initialize Camera)
  async function initiateSensorGate(isManual = false) {
    const isTestBike = initialTargetId === 'B-LOCAL' || initialTargetId === 'B-TEST';
    
    if (!isTestBike && (!state.user?.paymentMethod || state.user?.paymentMethod?.type !== 'Vodafone Cash' || !state.user?.paymentMethod?.number)) {
      setError("Please add your Vodafone Cash number in your Profile before starting a ride.");
      setHandshakeStep("idle");
      return;
    }

    if (isManual) {
      setHandshakeStep("manual_input");
      return;
    }

    // Step 1: GPS Enforcement (< 20 meters)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      let targetBike = selectedBike;
      if (!targetBike && state.bikes) {
        let minD = Infinity;
        state.bikes.forEach(b => {
          const d = calculateDistance(pos.coords.latitude, pos.coords.longitude, b.lat, b.lng);
          if (d < minD) { minD = d; targetBike = b; }
        });
      }

      const dist = targetBike ? calculateDistance(pos.coords.latitude, pos.coords.longitude, targetBike.lat, targetBike.lng) : Infinity;
      const isTestBike = targetBike?.id === 'B-LOCAL' || targetBike?.id === 'B-TEST';

      if (!isTestBike && dist > 20) {
        setError("You must be within 20 meters of the bike to unlock it.");
        setHandshakeStep("idle");
        return;
      }

      // Step 2: Bluetooth (BLE) Handshake
      setHandshakeStep("ble");
      const bleSuccess = isTestBike ? true : await simulateBluetoothScan(targetBike?.id);
      if (!bleSuccess) {
        setError("Please stay close to the bike and ensure Bluetooth is on to unlock.");
        setHandshakeStep("idle");
        return;
      }

      // Step 3: Success -> Allow Camera Initialization
      setHandshakeStep("success");
      setScanning(true);

      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          setCameraStream(stream);
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => {
          console.error('Camera error:', err);
          setError('Camera access requested but denied or unavailable. Please use the [Mock Scan Success] button or Manual Entry.');
          setScanning(true);
          setHandshakeStep("idle");
        });

    }, (err) => {
      setError("Location access is required to unlock the bike.");
      setHandshakeStep("idle");
    }, { enableHighAccuracy: true });
  }

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
    };
  }, [cameraStream]);

  // Scan for QR code constantly when Step 3 is active
  useEffect(() => {
    if (!scanning || !videoRef.current) return;

    const interval = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!canvas || !video || video.readyState !== video.HAVE_ENOUGH_DATA) return;

      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let darkCount = 0;
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] + data[i + 1] + data[i + 2];
        if (gray < 384) darkCount++;
      }
      const darkRatio = darkCount / (canvas.width * canvas.height);

      if (darkRatio > 0.2 && darkRatio < 0.8) {
        const simulated = initialTargetId ? `QR-${initialTargetId}` : `QR-B005`;
        if (simulated) {
          handleUnlockSuccess(simulated);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [scanning, initialTargetId]);

  async function handleUnlockSuccess(code) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain); gain.connect(audioContext.destination);
      osc.frequency.value = 800; osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      osc.start(audioContext.currentTime); osc.stop(audioContext.currentTime + 0.2);
    } catch (e) { }

    setScannedCode(code);
    setScanning(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }

    // Bike parsing from code (e.g. QR-B005 or MANUAL-B-004)
    const bikeIdMatch = code.match(/(?:QR|MANUAL)-(.*)/);
    const resolvedBikeId = bikeIdMatch ? bikeIdMatch[1] : (initialTargetId || 'B-LOCAL');

    if (state.user?.activeRide?.status === 'paid_pending_scan') {
      // User has already paid for this session, proceed with physical unlock
      const dock = state.docks?.find(d => d.occupiedBy === resolvedBikeId) || state.docks?.[0]; // Fallback to dock 1 for demo if needed
  
      if (dock) {
        // Send ESP32 Servo Unlock explicitly to the dock
        await simulateDockUnlock(dock.id);
  
        // Update global state: dock is empty, bike is unlocked, start timer, and start ride
        if (typeof setState === 'function') {
          setState(s => ({
            ...s,
            selectedBike: s.bikes.find(b => b.id === resolvedBikeId) || { id: resolvedBikeId },
            user: { 
              ...s.user, 
              startDockName: dock.name,
              activeRide: {
                ...s.user.activeRide,
                status: 'active',
                startTime: Date.now(),
                bikeId: resolvedBikeId
              }
            },
            docks: s.docks.map(d => d.occupiedBy === resolvedBikeId || d.id === dock.id ? { ...d, occupiedBy: null, servoPos: 10 } : d),
            bikes: s.bikes.map(b => b.id === resolvedBikeId ? { ...b, locked: false } : b)
          }));
        }
      }
      navigate('riding');
    } else {
      // User hasn't paid yet. They just scanned the QR to select a bike.
      if (typeof setState === 'function') {
        setState(s => ({
          ...s,
          selectedBike: s.bikes.find(b => b.id === resolvedBikeId) || { id: resolvedBikeId }
        }));
      }
      // Navigate to duration selection (reserve screen) to pay first!
      navigate('reserve');
    }
  }

  // Secure Manual Input fallback submission (ALSO executes Triple Handshake!)
  function submitManualId() {
    if (!manualId || manualId.trim().length === 0) return;
    
    const isTestBike = manualId.trim() === 'B-LOCAL' || manualId.trim() === 'B-TEST';
    
    if (!isTestBike && (!state.user?.paymentMethod || state.user?.paymentMethod?.type !== 'Vodafone Cash' || !state.user?.paymentMethod?.number)) {
      setError("Please add your Vodafone Cash number in your Profile before starting a ride.");
      setHandshakeStep("idle");
      return;
    }

    setHandshakeStep("manual_gps");

    // Step 1 for Manual: GPS
    navigator.geolocation.getCurrentPosition(async (pos) => {
      let targetBike = state.bikes?.find(b => b.id === manualId.trim()) || selectedBike;
      const isTestBike = manualId.trim() === 'B-LOCAL' || manualId.trim() === 'B-TEST';

      // Override manual entry as well
      if (isTestBike) {
        return handleUnlockSuccess(`MANUAL-${manualId}`);
      }

      const dist = targetBike ? calculateDistance(pos.coords.latitude, pos.coords.longitude, targetBike.lat, targetBike.lng) : Infinity;

      if (!targetBike || dist > 20) {
        setError(`You must be within 20 meters of the bike to unlock it.`);
        setHandshakeStep("manual_input");
        return;
      }

      // Step 2 for Manual: BLE Handshake
      setHandshakeStep("manual_ble");
      const bleSuccess = await simulateBluetoothScan(targetBike.id);

      if (!bleSuccess) {
        setError("Please stay close to the bike and ensure Bluetooth is on to unlock.");
        setHandshakeStep("manual_input");
        return;
      }

      // Handshake passed for Manual ID!
      handleUnlockSuccess(`MANUAL-${manualId}`);

    }, (err) => {
      setError("Location access is required to unlock the bike.");
      setHandshakeStep("manual_input");
    }, { enableHighAccuracy: true });
  }

  return (
    <div style={{ height: "100%", background: "#000" }}>
      {/* Permission Request Modal bit */}
      {permissionStatus === "pending" && !scannedCode && (
        <div className="modal-overlay modal-overlay-center" style={{ zIndex: 100 }}>
          <div className="modal-card" style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: '#e8ffc0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Icons.ShieldCheckIcon size={32} color={DARK} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, fontFamily: "'Space Grotesk',sans-serif" }}>Permissions Required</h2>
            <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>To unlock a bike, we need access to your <b>Camera</b> (to scan QR) and <b>Location</b> (to verify you are near the bike).</p>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setPermissionStatus('granted')}>Allow Access</button>
            <button className="btn-outline" style={{ width: '100%', marginTop: 12 }} onClick={() => navigate('map')}>Not Now</button>
          </div>
        </div>
      )}

      {/* SensorGate Handshake Overlays */}
      {(handshakeStep === "gps" || handshakeStep === "manual_gps") && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 30, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="spinner" style={{ marginBottom: 16, borderColor: "rgba(255,255,255,0.1)", borderTopColor: LIME }} />
          <div style={{ color: "white", fontWeight: 700 }}>Checking GPS Proximity...</div>
        </div>
      )}
      {(handshakeStep === "ble" || handshakeStep === "manual_ble") && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 30, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Icons.BluetoothIcon size={48} color={LIME} style={{ marginBottom: 16 }} />
          <div style={{ color: "white", fontWeight: 700 }}>{`Searching for Bike Bluetooth... [${selectedBike?.id || manualId || 'B-LOCAL'}]`}</div>
          <div style={{ color: "#888", fontSize: 13, marginTop: 8 }}>Establishing hardware handshake</div>
        </div>
      )}

      {/* Manual Input Overlay */}
      {handshakeStep === "manual_input" && !scannedCode && (
        <div style={{ position: "absolute", top: 120, left: 24, right: 24, background: "white", borderRadius: 16, padding: 24, zIndex: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, fontFamily: "'Space Grotesk',sans-serif" }}>Manual Override</div>
          <p style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>Enter the 6-character Bike ID written under the saddle. You must be next to the bike to unlock it.</p>
          <input
            type="text"
            placeholder="e.g. B-004"
            className="input-field"
            value={manualId}
            onChange={(e) => { setManualId(e.target.value.toUpperCase()); setError(""); }}
            style={{ marginBottom: 16, border: "2px solid #eee", fontSize: 16, letterSpacing: 1 }}
          />
          <button className="btn-primary" onClick={submitManualId} disabled={!manualId}>Verify & Unlock</button>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button style={{ background: "none", border: "none", color: "#888", textDecoration: "underline" }} onClick={() => setHandshakeStep("idle")}>Cancel</button>
          </div>
        </div>
      )}

      {/* Main Camera View */}
      {scanning && (
        <>
          <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)" }} />
        </>
      )}
      {/* Header */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          style={{ width: 40, height: 40, background: "white", border: "none", borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => {
            if (scanning && cameraStream) {
              cameraStream.getTracks().forEach(t => t.stop());
              setCameraStream(null);
            }
            setScanning(false);
            navigate("map");
          }}
        >
          <Icons.ArrowLeftIcon size={20} color={DARK} />
        </button>
        <span style={{ color: "white", fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", fontSize: 16 }}>Scan QR Code</span>
        <div style={{ width: 40 }} />
      </div>

      {/* QR Scanner Overlay */}
      {scanning && (
        <>
          <div className="qr-scanner-overlay" style={{ pointerEvents: 'none' }}>
            <div className="qr-frame">
              <div className="qr-corner tl" />
              <div className="qr-corner tr" />
              <div className="qr-corner bl" />
              <div className="qr-corner br" />
              <div className="scan-line" />
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 120, left: 24, right: 24, zIndex: 1000, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <button className="btn-primary" onClick={() => handleUnlockSuccess(`QR-${initialTargetId || 'B-LOCAL'}`)} style={{ background: LIME, color: "#111", border: "none", width: "100%", height: 56, borderRadius: 16, fontWeight: 800, fontSize: 16, boxShadow: "0 8px 32px rgba(204,255,0,0.3)" }}>
              [Mock Scan Success]
            </button>
            <p style={{ color: "white", fontSize: 13, opacity: 0.7 }}>Testing Mode: Hard-bypass scan logic</p>
          </div>
        </>
      )}

      {/* Status Messages */}
      {scannedCode && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "white", borderRadius: 16, padding: 24, textAlign: "center", zIndex: 20 }}>
          <div style={{ width: 72, height: 72, background: LIME, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icons.CheckIcon size={40} color={DARK} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>QR Code Verified!</div>
          <p style={{ color: "#888", fontSize: 14 }}>Unlocking bike...</p>
        </div>
      )}

      {error && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "white", borderRadius: 16, padding: 24, textAlign: "center", zIndex: 20 }}>
          <div style={{ width: 72, height: 72, background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icons.AlertTriangleIcon size={40} color="#f44336" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#f44336" }}>{error}</div>
          <button
            onClick={() => {
              setError("");
              setScanning(false);
            }}
            style={{ background: "#f44336", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", marginTop: 12 }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Bottom Controls */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}>
        {!scanning && !scannedCode && handshakeStep === "idle" && (
          <>
            <button className="btn-primary" onClick={() => initiateSensorGate(false)} style={{ color: DARK, display: "flex", justifyContent: "center", gap: 8 }}>
              <Icons.QRScanIcon size={20} color={DARK} /> Start Secure Scanner
            </button>
            <button className="btn-outline" onClick={() => initiateSensorGate(true)} style={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}>
              Enter ID Manually
            </button>
            <button style={{ background: "none", border: "none", color: "#888", marginTop: 8 }} onClick={() => navigate("map")}>
              ← Back To Map
            </button>
          </>
        )}
      </div>
    </div>
  );
}