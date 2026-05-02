import React, { useState, useEffect } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';
import { simulateDockUnlock } from '../features/telemetry/SensorGate.js';

const RATE_PER_MIN = 0.5;

export default function ReserveScreen({ navigate, state, setState }) {
  const [hours, setHours] = useState(0);
  const [mins, setMins] = useState(15);
  const [step, setStep] = useState('duration'); // 'duration' | 'payment'
  const [walletNumber, setWalletNumber] = useState(state.user?.phone || '');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (state.user?.status && state.user.status !== 'verified') {
      navigate('statusDashboard');
    }
  }, [state.user?.status, navigate]);

  const totalMins = hours * 60 + mins;
  const estimatedPrice = totalMins * RATE_PER_MIN;

  const handleQuickSelect = (m) => {
    if (m >= 60) {
      setHours(Math.floor(m / 60));
      setMins(m % 60);
    } else {
      setHours(0);
      setMins(m);
    }
  };

  const adjustHours = (delta) => setHours(prev => Math.max(0, Math.min(24, prev + delta)));
  const adjustMins = (delta) => setMins(prev => {
    let newValue = prev + delta;
    if (newValue < 0) return 45;
    if (newValue >= 60) return 0;
    return newValue;
  });

  const handleProceedToPayment = () => {
    if (totalMins < 5) {
      alert("Minimum duration is 5 minutes");
      return;
    }
    setStep('payment');
  };

  const handleConfirmPay = async () => {
    if (!walletNumber || walletNumber.length < 10) {
      alert("Please enter a valid wallet number");
      return;
    }

    setIsProcessing(true);
    
    const bikeId = state.selectedBike?.id || 'B005';
    const dock = state.docks?.find(d => d.occupiedBy === bikeId) || state.docks?.[0];
    setTimeout(() => {
      setState(s => ({
        ...s,
        user: {
          ...s.user,
          activeRide: {
            bikeId: bikeId,
            startTime: Date.now(),
            reservedDurationSecs: totalMins * 60,
            paidAmount: estimatedPrice,
            status: 'paid_pending_scan'
          }
        },
        selectedBike: state.selectedBike || { id: 'B005' }
      }));
      
      setIsProcessing(false);
      navigate("scanQR");
    }, 2000);
  };

  return (
    <div style={{ minHeight: "100%", background: "white", display: "flex", flexDirection: "column" }}>
      <StatusBar />
      <div style={{ padding: "8px 24px 32px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <BackBtn onBack={() => setStep(prev => prev === 'payment' ? 'duration' : 'map')} />
          <div style={{ fontWeight: 800, fontSize: 18, fontFamily: "'Space Grotesk',sans-serif" }}>
            {step === 'duration' ? 'Reserve For Duration' : 'Payment'}
          </div>
        </div>

        {step === 'duration' ? (
          <>
            <div style={{ background: "#f8f8f8", borderRadius: 16, padding: 16, marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, background: LIME, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icons.BikeIconSVG size={28} color={DARK} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "'Space Grotesk',sans-serif" }}>
                  Bike {state.selectedBike?.id || "B004"}
                </div>
                <div style={{ color: "#666", fontSize: 12 }}>Regular Bike</div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: DARK, marginBottom: 12 }}>Quick Select</div>
              <div style={{ display: "flex", gap: 10 }}>
                {[15, 30, 60].map(m => (
                  <button 
                    key={m}
                    onClick={() => handleQuickSelect(m)}
                    style={{ 
                      flex: 1, padding: "12px", borderRadius: 10, border: "none",
                      background: totalMins === m ? LIME : "#f0f0f0",
                      color: DARK, fontWeight: 700, fontSize: 13, cursor: "pointer"
                    }}
                  >
                    {m >= 60 ? '1 hour' : `${m} min`}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: DARK, marginBottom: 12 }}>Custom Duration</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 40, alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <button onClick={() => adjustHours(1)} style={stepperBtn}>+</button>
                  <div style={stepperBox}>{hours}</div>
                  <button onClick={() => adjustHours(-1)} style={stepperBtn}>-</button>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 4, fontWeight: 600 }}>hours</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <button onClick={() => adjustMins(15)} style={stepperBtn}>+</button>
                  <div style={stepperBox}>{mins}</div>
                  <button onClick={() => adjustMins(-15)} style={stepperBtn}>-</button>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 4, fontWeight: 600 }}>min</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "auto" }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: "#999", fontWeight: 600, marginBottom: 4 }}>Estimated Price</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: DARK }}>
                  {estimatedPrice.toFixed(2)} <span style={{ fontSize: 14, color: "#888" }}>EGP</span>
                </div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <Icons.InfoIcon size={14} /> For {totalMins} minutes . {RATE_PER_MIN} EGP/min
                </div>
              </div>
              <button className="btn-primary" onClick={handleProceedToPayment} style={{ width: "100%" }}>
                Proceed to Pay
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ background: "#f6f6f8", borderRadius: 16, padding: "24px 16px", display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{ width: 48, height: 48, background: '#ce1126', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.PhoneIcon size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: DARK }}>Vodafone Cash</div>
                  <div style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>Amount to pay: <span style={{ color: '#ce1126' }}>{estimatedPrice.toFixed(2)} EGP</span></div>
                </div>
              </div>

              <input
                type="tel" inputMode="numeric" maxLength={11}
                placeholder="01XXXXXXXXX"
                value={walletNumber}
                onChange={e => setWalletNumber(e.target.value.replace(/\D/g, ''))}
                style={{ width: '100%', boxSizing: 'border-box', padding: '16px', borderRadius: 12, border: '2px solid #ddd', background: '#fff', color: DARK, fontSize: 18, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", outline: 'none', letterSpacing: 2, textAlign: 'center' }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ background: "rgba(255, 59, 48, 0.05)", borderRadius: 12, padding: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Icons.AlertTriangleIcon size={16} color="#FF3B30" />
                <div style={{ fontSize: 11, color: "#666", lineHeight: 1.4 }}>
                  <b>Non-refundable:</b> Once payment is confirmed, the duration is booked and cannot be refunded even if you finish the ride early.
                </div>
              </div>
            </div>

            <button 
              className="btn-primary" 
              onClick={handleConfirmPay} 
              disabled={isProcessing}
              style={{ width: "100%", opacity: isProcessing ? 0.7 : 1 }}
            >
              {isProcessing ? "Processing..." : `Pay ${estimatedPrice.toFixed(2)} EGP`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const stepperBtn = { 
  width: 36, height: 36, borderRadius: "50%", border: "1px solid #ddd", 
  background: "white", fontSize: 20, fontWeight: 700, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center"
};
const stepperBox = { 
  width: 70, height: 80, background: "#f8f8f8", borderRadius: 16, 
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 32, fontWeight: 800, margin: "8px 0"
};