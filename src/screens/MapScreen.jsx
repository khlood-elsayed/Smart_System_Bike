import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';
import LeafletMap from '../features/telemetry/LeafletMap';
import { DAMIETTA_BIKES, DAMIETTA_GEOFENCE, pointInPolygon } from '../features/telemetry/geofence';
import { calculateDistance, simulateBluetoothScan } from '../features/telemetry/SensorGate.js';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

export default
  function MapScreen({ navigate, state, setState }) {
  const [selectedBike, setSelectedBike] = useState(null);
  // Handle bike object lookup derived from selected ID
  const selectedBikeObj = state.bikes?.find(b => b.id === selectedBike) || DAMIETTA_BIKES.find(b => b.id === selectedBike) || null;

  console.log("MapScreen check ->", "selectedBike:", selectedBike, "selectedBikeObj:", selectedBikeObj);
  const [showDrawer, setShowDrawer] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [findingNearest, setFindingNearest] = useState(false);
  const [nearestDock, setNearestDock] = useState(null); // { dock, distanceM }
  const mapInstanceRef = useRef(null); // shared map ref for panning
  const btnBoxStyle = { width: 44, height: 44, borderRadius: 12, background: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" };

  // Watch global reservation timer
  useEffect(() => {
    let interval;
    if (state.user?.activeReservation) {
      const updateTimer = () => {
        const remaining = Math.max(0, state.user.activeReservation.expiresAt - Date.now());
        if (remaining === 0) {
          setState(s => ({ ...s, user: { ...s.user, activeReservation: null } }));
          clearInterval(interval);
        } else {
          setTimeLeft(remaining);
        }
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [state.user?.activeReservation, setState]);

  // start GPS tracking — fallback to Damietta center for laptop/simulator
  useEffect(() => {
    let watchId;
    const DAMIETTA_FALLBACK = { lat: 31.4398, lng: 31.6705 }; // Damietta University dock area

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(DAMIETTA_FALLBACK), // GPS denied → use Damietta
        { enableHighAccuracy: true, timeout: 6000 }
      );
      watchId = navigator.geolocation.watchPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true }
      );
    } else {
      setUserLocation(DAMIETTA_FALLBACK);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const displayBikes = state.bikes || [];
  const displayDocks = state.docks || [];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fff" }}>
      {/* 60% Map Height - Locked with Z-Index for Mobile */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: selectedBikeObj !== null ? '55%' : '100%', zIndex: 1, backgroundColor: '#e8eaf0', transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <LeafletMap
          bikes={displayBikes}
          docks={displayDocks}
          onBikeClick={id => {
            // No longer navigating to scan immediately.
            // Always show the info drawer first.
            setSelectedBike(id);
            setNearestDock(null); // clear nearest dock banner when a bike is chosen
          }}
          selectedBike={selectedBike}
          userLocation={userLocation}
          nearestDock={nearestDock?.dock || null}
        />
      </div>

      {/* Map Empty State Layer */}
      {displayBikes.length === 0 && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 5, textAlign: "center", background: "white", padding: "32px 24px", borderRadius: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.1)", width: "85%" }}>
          <div style={{ width: 80, height: 80, background: "#f5f5f5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Icons.BikeIconSVG size={40} color={DARK} className="opacity-40" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: DARK, marginBottom: 8 }}>Area Unavailable</h2>
          <p style={{ color: "#666", fontSize: 14, lineHeight: 1.5 }}>There are no bikes currently deployed in your immediate vicinity. Please check back later or refresh.</p>
        </div>
      )}

      {/* Top bar: Menu + Bell */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, display: "flex", justifyContent: "space-between", padding: "14px 16px 8px" }}>
        <button style={btnBoxStyle} onClick={() => setShowDrawer(true)} aria-label="Open menu">
          <Icons.MenuIcon size={20} />
        </button>
        <button style={{ ...btnBoxStyle, position: "relative" }} onClick={() => navigate("notifications")} aria-label="Notifications">
          <Icons.BellIcon size={20} />
          <span style={{ position: "absolute", top: 6, right: 6, width: 16, height: 16, background: "#FF3B30", borderRadius: "50%", fontSize: 9, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>4</span>
        </button>
      </div>

      {/* Active Reservation Banner */}
      {state.user?.activeReservation && timeLeft > 0 && (
        <div style={{ position: "absolute", top: 80, left: 16, right: 16, background: "rgba(26,26,26,0.9)", backdropFilter: "blur(10px)", border: `1px solid ${LIME}`, borderRadius: 12, padding: 12, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, background: LIME, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icons.BikeIconSVG size={20} color={DARK} />
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 13, fontFamily: "'Space Grotesk',sans-serif" }}>Hold on {state.user.activeReservation.bikeId}</div>
              <div style={{ color: LIME, fontWeight: 700, fontSize: 15 }}>
                {(() => {
                  const m = Math.floor(timeLeft / 60000);
                  const s = Math.floor((timeLeft % 60000) / 1000);
                  return `${m}:${s < 10 ? '0' : ''}${s}`;
                })()} remaining
              </div>
            </div>
          </div>
          <button style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }} onClick={() => setState(s => ({ ...s, user: { ...s.user, activeReservation: null } }))}>
            Cancel
          </button>
        </div>
      )}

      {/* Right-side FABs */}
      <div style={{ position: "absolute", bottom: 90, right: 16, zIndex: 10, display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          style={{ ...btnBoxStyle, background: LIME }}
          aria-label="My location"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              }, (err) => alert("GPS Refresh failed: " + err.message));
            }
          }}
        >
          <Icons.LocationIcon size={20} color={DARK} />
        </button>
        <button style={btnBoxStyle} aria-label="Refresh map" onClick={() => { console.log("Refreshing bikes..."); window.location.reload(); }}>
          <Icons.RefreshIcon size={20} />
        </button>
        <button 
          style={{ ...btnBoxStyle, background: DARK }} 
          title="Deploy Test Dock Here"
          onClick={async () => {
            if (!userLocation) return alert("Location unknown!");
            if (window.confirm("Pin the Test Dock & Bike to your current GPS location?")) {
              try {
                await updateDoc(doc(db, "docks", "DOCK-DU-01"), { lat: userLocation.lat, lng: userLocation.lng });
                await updateDoc(doc(db, "bikes", "B-LOCAL"), { lat: userLocation.lat, lng: userLocation.lng });
                alert("Dock & Bike successfully pinned to this physical location!");
              } catch (e) {
                alert("Failed: " + e.message);
              }
            }
          }}
        >
          <Icons.ShieldCheckIcon size={20} color={LIME} />
        </button>
      </div>

      {/* Left-side FAB */}
      <div style={{ position: "absolute", bottom: 90, left: 16, zIndex: 10 }}>
        <button style={btnBoxStyle} aria-label="Support" onClick={() => navigate("legal")}>
          <Icons.HeadsetIcon size={20} />
        </button>
      </div>

      {selectedBikeObj === null ? (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 16px 32px", zIndex: 10, display: "flex", flexDirection: 'column', alignItems: 'center', gap: 12 }}>

          {/* Nearest Dock Info Banner */}
          {nearestDock && (
            <div style={{
              width: '100%', maxWidth: 450,
              background: 'rgba(17,17,17,0.92)', backdropFilter: 'blur(12px)',
              borderRadius: 20, padding: '14px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.1)',
              animation: 'slideUpMap 0.35s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, background: '#007AFF', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, boxShadow: '0 0 0 4px rgba(0,122,255,0.2)'
                }}>
                  <Icons.LocationIcon size={20} color="white" />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: 14, fontFamily: "'Space Grotesk',sans-serif" }}>
                    📍 {nearestDock.dock.name || 'Nearest Dock'}
                  </div>
                  <div style={{ color: '#CCFF00', fontWeight: 700, fontSize: 13, marginTop: 2 }}>
                    {nearestDock.distanceM < 1000
                      ? `${nearestDock.distanceM} m away`
                      : `${(nearestDock.distanceM / 1000).toFixed(1)} km away`
                    } · Tap the dock on the map
                  </div>
                </div>
              </div>
              <button
                onClick={() => setNearestDock(null)}
                style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >✕</button>
            </div>
          )}

          <button
            className="btn-primary"
            style={{
              boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
              background: findingNearest ? '#ccc' : LIME, color: DARK, cursor: findingNearest ? 'not-allowed' : 'pointer',
              height: 58, borderRadius: 18, width: '100%', maxWidth: 450,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              fontWeight: 800, fontSize: 17, border: 'none',
              transition: 'background 0.3s'
            }}
            disabled={findingNearest}
            onClick={() => {
              setFindingNearest(true);

              const doFind = (lat, lng) => {
                // Find docks that have a bike (occupiedBy !== null)
                const docksWithBike = (state.docks || []).filter(d => d.occupiedBy && d.lat && d.lng);

                if (docksWithBike.length === 0) {
                  alert('No available bikes found in any dock right now.');
                  setFindingNearest(false);
                  return;
                }

                // Sort by distance from user
                let nearest = null;
                let minDist = Infinity;
                docksWithBike.forEach(d => {
                  const dist = calculateDistance(lat, lng, d.lat, d.lng);
                  if (dist < minDist) {
                    minDist = dist;
                    nearest = d;
                  }
                });

                if (nearest) {
                  // Show the nearest dock banner — user clicks the dock themselves
                  setNearestDock({ dock: nearest, distanceM: Math.round(minDist) });
                }
                setFindingNearest(false);
              };

              if (userLocation) {
                doFind(userLocation.lat, userLocation.lng);
              } else {
                navigator.geolocation.getCurrentPosition(
                  (pos) => doFind(pos.coords.latitude, pos.coords.longitude),
                  () => {
                    // Fallback: use mock origin if GPS fails
                    doFind(0, 0);
                  },
                  { enableHighAccuracy: true, timeout: 5000 }
                );
              }
            }}
          >
            {findingNearest ? (
              <>
                <div className="spinner" style={{ width: 20, height: 20, border: '3px solid rgba(0,0,0,0.15)', borderTopColor: DARK, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Locating nearest dock...
              </>
            ) : (
              <>
                <Icons.LocationIcon size={22} color={DARK} />
                Find Nearest Dock
              </>
            )}
          </button>
        </div>
      ) : (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: "#fff",
          borderTopLeftRadius: 36,
          borderTopRightRadius: 36,
          padding: "16px 24px env(safe-area-inset-bottom, 32px)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -10px 40px rgba(0,0,0,0.12)",
          animation: 'slideUpMap 0.4s ease-out'
        }}>
          {/* Handlebar */}
          <div style={{ width: 44, height: 6, background: '#E0E0E0', borderRadius: 3, margin: '0 auto 20px' }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 22, fontFamily: "'Space Grotesk',sans-serif", color: DARK, marginBottom: 16 }}>
                Bike #{selectedBikeObj.id || 'N/A'}
              </div>

              {/* Stats Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icons.LocationIcon size={20} color={DARK} />
                  </div>
                  <span style={{ fontSize: 15, color: '#999', fontWeight: 600 }}>120 M Range</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icons.ClockIcon size={20} color={DARK} />
                  </div>
                  <span style={{ fontSize: 15, color: '#999', fontWeight: 600 }}>2 Min Walking</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icons.WalletIcon size={20} color={DARK} />
                  </div>
                  <span style={{ fontSize: 15, color: '#999', fontWeight: 600 }}>{selectedBikeObj.rate || '0.5 EGP'} / Min, 20 /Hour</span>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <button
                style={{ position: 'absolute', top: -10, right: -10, width: 36, height: 36, borderRadius: '50%', background: "#F5F6F7", border: "none", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
                onClick={() => setSelectedBike(null)}
              >
                <Icons.XIcon size={18} color={DARK} />
              </button>
              <img
                src="./src/assets/bike_illustration.png"
                alt="Bike"
                style={{ width: 140, height: 'auto', objectFit: 'contain' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
            <button
              className="btn-primary"
              style={{
                height: 60, borderRadius: 16, background: LIME, color: DARK,
                fontWeight: 900, fontSize: 18, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
              }}
              onClick={() => {
                const bike = selectedBikeObj;
                setState(s => ({ ...s, selectedBike: bike }));
                navigate("reserve");
              }}
            >
              <Icons.WalletIcon size={22} color={DARK} />
              Select Time & Pay First
            </button>
          </div>
        </div>
      )}

      {/* Side Drawer */}
      {showDrawer && (
        <div className="drawer-overlay" style={{ zIndex: 1000 }}>
          <div className="drawer-bg" onClick={() => setShowDrawer(false)} />
          <div className="drawer" style={{ animation: 'slideRight 0.3s ease-out' }}>
            <div style={{ background: LIME, padding: "60px 24px 36px", borderBottomLeftRadius: 30 }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}
                onClick={() => {
                  setShowDrawer(false);
                  navigate('profile');
                }}
              >
                <div style={{ width: 72, height: 72, background: DARK, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: '4px solid white' }}>
                  {state.user?.profilePic ? (
                    <img src={state.user.profilePic} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Icons.UserIcon size={32} color="white" />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 19, fontFamily: "'Space Grotesk',sans-serif", color: DARK }}>{state.user?.name || 'Smart User'}</div>
                  <div style={{ fontSize: 13, color: '#333', marginTop: 4, fontWeight: 600 }}>{state.user?.phone || 'No phone'}</div>
                </div>
              </div>
            </div>
            <div style={{ padding: "24px 0" }}>
              {[
                { icon: <Icons.BikeIconSVG size={22} color={DARK} />, label: "My Rides", screen: "history" },
                { icon: <Icons.WalletIcon size={22} color={DARK} />, label: "Payment Methods", screen: "editProfile" },
                { icon: <Icons.HelpCircleIcon size={22} color={DARK} />, label: "How to Ride", screen: "howToRide" },
                { icon: <Icons.UserSettingsIcon size={22} color={DARK} />, label: "Settings", screen: "settings" },
                { icon: <Icons.AlertIcon size={22} color="#f44336" />, label: "Report Issue", screen: "reportIssue" },
              ].map(item => (
                <button
                  key={item.label}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 18, padding: "18px 28px", background: "none", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, color: DARK }}
                  onClick={() => { setShowDrawer(false); navigate(item.screen); }}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}