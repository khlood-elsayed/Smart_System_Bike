import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';
import LeafletMap from '../features/telemetry/LeafletMap';
export default 
function AdminDashboard({ navigate, state, setState }) {
  const [section, setSection] = useState('users');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [zoomSrc, setZoomSrc] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  // single hardware bike object
  const [bike, setBike] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!state.user || state.user.role !== 'admin') {
      navigate('login');
      return;
    }
  }, [state.user?.role, navigate]);

  useEffect(() => {
    // load pending users from storage
    let allUsers = [];
    try {
      allUsers = JSON.parse(localStorage.getItem('pending_users') || '[]');
    } catch { allUsers = []; }
    setPendingUsers(allUsers);

    // load total users count from master list
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem('users') || '[]');
    } catch { users = []; }
    setTotalUsers(users.length);

    // load single hardware bike
    const hw = localStorage.getItem('bike_hardware');
    if (hw) {
      try {
        setBike(JSON.parse(hw));
      } catch { setBike(null); }
    } else {
      // default initial object
      const initial = { id: 'BIKE-001', battery: 100, locked: true, coords: { lat: 0, lon: 0 }, health: 'good' };
      localStorage.setItem('bike_hardware', JSON.stringify(initial));
      setBike(initial);
    }

    // load alerts
    const storedAlerts = localStorage.getItem('alerts');
    if (storedAlerts) {
      try { setAlerts(JSON.parse(storedAlerts)); } catch { setAlerts([]); }
    } else {
      setAlerts([]);
    }
  }, []);

  useEffect(() => {
    if (bike) localStorage.setItem('bike_hardware', JSON.stringify(bike));
  }, [bike]);
  useEffect(() => { localStorage.setItem('alerts', JSON.stringify(alerts)); }, [alerts]);

  function handleApproveUser(email) {
    // remove from pending array
    let pending = [];
    try {
      pending = JSON.parse(localStorage.getItem('pending_users') || '[]');
      pending = pending.filter(u => u.email !== email);
      localStorage.setItem('pending_users', JSON.stringify(pending));
    } catch { }
    setPendingUsers(pending);
    setSelectedUser(null);

    // update master users list status
    try {
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      users = users.map(u => u.email === email ? { ...u, status: 'verified' } : u);
      localStorage.setItem('users', JSON.stringify(users));

      // If user is currently logged in, update their state
      const user = users.find(u => u.email === email);
      if (user) {
        console.log('User verified:', user.phone, user.name);
      }
      setTotalUsers(users.length);
    } catch { }
  }

  function handleRejectUser(email) {
    if (window.confirm('Are you sure you want to reject this verification? The user will need to resubmit.')) {
      // remove from pending list
      let pending = [];
      try {
        pending = JSON.parse(localStorage.getItem('pending_users') || '[]');
        pending = pending.filter(u => u.email !== email);
        localStorage.setItem('pending_users', JSON.stringify(pending));
      } catch { }
      setPendingUsers(pending);
      setSelectedUser(null);

      // mark user as rejected in master list and clear their uploads
      try {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        users = users.map(u => u.email === email ? {
          ...u,
          status: 'rejected',
          uploads: {} // Clear uploads so they must restart
        } : u);
        localStorage.setItem('users', JSON.stringify(users));

        // Log rejection for admin audit
        const user = users.find(u => u.email === email);
        if (user) {
          console.log('User rejected:', user.phone, user.name);
        }
        setTotalUsers(users.length);
      } catch { }
    }
  }

  function handleSendNote(email, note) {
    if (!note.trim()) {
      alert('Please enter a note');
      return;
    }

    // Update in pending_users array
    try {
      let pending = JSON.parse(localStorage.getItem('pending_users') || '[]');
      pending = pending.map(u => u.email === email ? { ...u, note } : u);
      localStorage.setItem('pending_users', JSON.stringify(pending));
      setPendingUsers(pending);
    } catch { }

    // Update in master users list
    try {
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      users = users.map(u => u.email === email ? { ...u, note } : u);
      localStorage.setItem('users', JSON.stringify(users));
    } catch { }

    // Simulate email notification
    const user = selectedUser;
    if (user && user.phone) {
      console.log('EMAIL NOTIFICATION SENT');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('To:', user.email);
      console.log('Phone:', user.phone);
      console.log('Subject: Message from SmartBike Admin');
      console.log('Body:');
      console.log(note);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');

      // TODO: Integrate real email service here
      // Using EmailJS or Firebase Cloud Functions:
      // await emailjs.send('service_id', 'template_id', {
      //   to_email: user.email,
      //   subject: 'Message from SmartBike Admin',
      //   message: note,
      //   user_name: user.name
      // });
    }

    alert('Note sent to user');
  }

  // helper to update hardware state both locally and in storage
  function updateHardware(changes) {
    if (bike) {
      setBike(b => {
        const updated = { ...b, ...changes };
        localStorage.setItem('bike_hardware', JSON.stringify(updated));
        return updated;
      });
    }
  }

  function setFaulty() {
    if (bike) {
      updateHardware({ health: 'faulty' });
      setAlerts(a => [...a, { bikeId: bike.id, time: Date.now(), message: 'Marked faulty' }]);
    }
  }
  function triggerAlarm(id) { setAlerts(a => [...a, { bikeId: id, time: Date.now(), message: 'Theft alarm triggered' }]); }

  function addBike() {
    const newBike = { id: Date.now(), battery: 100, locked: true, health: 'good', coords: null };
    setBike(newBike);
    localStorage.setItem('bike_hardware', JSON.stringify(newBike));
  }

  // security check: if locked and coords change
  const prevCoords = useRef(bike?.coords);
  useEffect(() => {
    const interval = setInterval(() => {
      const hw = localStorage.getItem('bike_hardware');
      if (!hw) return;
      try {
        const data = JSON.parse(hw);
        if (data.locked && prevCoords.current && data.coords &&
          (data.coords.lat !== prevCoords.current.lat || data.coords.lon !== prevCoords.current.lon)) {
          triggerAlarm(data.id);
        }
        prevCoords.current = data.coords;
        setBike(data);
      } catch { }
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  function handleLogout() {
    if (window.confirm('Log out of admin panel?')) {
      localStorage.removeItem('bike_app_user');
      // Reset to completely empty user — clears admin role and all flags
      setState(s => ({
        ...s,
        user: { name: '', email: '', profilePic: '', role: '', phone: '', first: '', middle: '', last: '', nid: '', status: null, isEditingProfile: false }
      }));
      navigate('welcome');
    }
  }

  if (!state.user || state.user.role !== 'admin') return <div />;

  const lowBattery = bike && bike.battery < 10 ? [bike] : [];
  const theftLogs = alerts;

  return (
    <div style={{ minHeight: "100%", background: "#f5f5f5", display: "flex", flexDirection: "column" }}>
      <div style={{ background: LIME, padding: "20px 24px", color: DARK, marginBottom: 20 }}>
        <div>
          <div className="page-title" style={{ marginBottom: 4, color: DARK }}>Admin Control Panel</div>
          <p style={{ fontSize: 13, color: "#555", margin: 0 }}>Manage users, hardware & monitoring</p>
        </div>
      </div>
      <div style={{ display: "flex", padding: "0 24px", gap: 0, marginBottom: 10, overflowX: 'auto' }}>
        {['users', 'bikes', 'monitor', 'security'].map(sec => (
          <button key={sec} onClick={() => setSection(sec)} style={{ padding: "12px 16px", border: "none", borderBottom: section === sec ? `4px solid ${sec === 'security' ? '#f44336' : LIME}` : "4px solid transparent", background: "none", cursor: "pointer", fontWeight: section === sec ? 700 : 500, textAlign: 'center', whiteSpace: 'nowrap', color: section === sec && sec === 'security' ? '#f44336' : 'inherit' }}>
            {sec === 'users' ? 'User Verifications' : sec === 'bikes' ? 'Bike Management' : sec === 'monitor' ? 'Live Monitoring' : '🔴 Security Alerts'}
            {sec === 'security' && alerts.length > 0 && <span style={{ marginLeft: 6, background: '#f44336', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{alerts.length}</span>}
          </button>
        ))}
      </div>
      <div style={{ padding: "0 24px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 0 }}>
          <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 8 }}>Total Users</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: DARK }}>{totalUsers}</div>
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.088)" }}>
            <div style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center' }}><Icons.DotIcon color="#ff9800" style={{ marginRight: 4 }} />Pending</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#ff9800" }}>{pendingUsers.length}</div>
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.088)" }}>
            <div style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 8 }}>Total Bikes</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#4CAF50" }}>{bike ? 1 : 0}</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, padding: "0 24px 24px", overflow: "auto" }}>
        {section === 'users' && (
          <>
            {pendingUsers.length === 0 ? (
              <div style={{ background: "white", borderRadius: 12, padding: 40, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.088)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>
                  <Icons.CheckCircleIcon size={48} color="#4CAF50" />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>All Clear!</div>
                <p style={{ color: "#888", fontSize: 14, margin: 0 }}>No pending verifications at this time.</p>
              </div>
            ) : (
              <div style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.088)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8f8f8", borderBottom: "2pxsolid #eee" }}>
                      <th style={{ padding: 12, textAlign: "left", fontWeight: 700, fontSize: 12, color: "#666" }}>User</th>
                      <th style={{ padding: 12, textAlign: "left", fontWeight: 700, fontSize: 12, color: "#666" }}>Email</th>
                      <th style={{ padding: 12, textAlign: "center", fontWeight: 700, fontSize: 12, color: "#666" }}>Photos</th>
                      <th style={{ padding: 12, textAlign: "center", fontWeight: 700, fontSize: 12, color: "#666" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((user, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: 12 }}><div style={{ fontWeight: 600, fontSize: 13, color: DARK }}>{user.name || 'User'}</div></td>
                        <td style={{ padding: 12, fontSize: 12, color: "#666" }}>{user.email}</td>
                        <td style={{ padding: 12, textAlign: "center", fontSize: 12 }}><button onClick={() => setSelectedUser(user)} style={{ background: LIME, color: DARK, border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 600, fontSize: 11 }}>View Photos</button></td>
                        <td style={{ padding: 12, textAlign: "center" }}><button onClick={() => handleApproveUser(user.email)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: "#4CAF50", color: "white", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontWeight: 600, fontSize: 11, marginRight: 6 }}><Icons.CheckCircleIcon size={12} style={{ marginRight: 4 }} />Verify</button><button onClick={() => handleRejectUser(user.email)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: "#f44336", color: "white", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontWeight: 600, fontSize: 11 }}><Icons.XCircleIcon size={12} style={{ marginRight: 4 }} />Reject</button>
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        {section === 'bikes' && (
          <>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ fontSize: 18, fontWeight: 700 }}>Bike Inventory</div><button onClick={addBike} style={{ background: LIME, color: DARK, border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center' }}><Icons.PlusIcon size={14} style={{ marginRight: 6 }} />Add Bike</button>
</div>
            {!bike ? (
              <p style={{ color: '#888' }}>No hardware bike configured.</p>
            ) : (
              <div style={{ padding: 16 }}>
                <div><strong>ID:</strong> {bike.id}</div>
                <div><strong>Battery:</strong> {bike.battery}%</div>
                <div><strong>Lock:</strong> {bike.locked ? 'Locked' : 'Unlocked'}</div>
                <div><strong>Health:</strong> {bike.health}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <button onClick={() => updateHardware({ locked: !bike.locked })} style={{ background: bike.locked ? '#2196F3' : '#FFC107', color: 'white', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>
                    {bike.locked ? <><Icons.UnlockIcon size={14} style={{ marginRight: 4 }} />Unlock</> : <><Icons.LockToggleIcon size={14} style={{ marginRight: 4 }} />Lock</>}
                  </button>
                  <button onClick={setFaulty} style={{ background: '#f44336', color: 'white', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: "pointer", display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icons.AlertTriangleIcon size={14} color="white" /> Set Faulty
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        {section === 'monitor' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, background: LIME, borderRadius: '50%', boxShadow: `0 0 10px ${LIME}`, animation: 'pulse 1.5s infinite' }} />
                Live Fleet Tracking
              </div>
              <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Real-time GPS coordinates of active bikes and docks.</p>
            </div>
            <div style={{ flex: 1, borderRadius: 16, overflow: 'hidden', border: '2px solid #ddd', minHeight: 300, position: 'relative', zIndex: 0 }}>
              <LeafletMap bikes={state.bikes || []} docks={state.docks || []} />
            </div>
          </div>
        )}
        {section === 'security' && (
          <>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.ShieldAlertIcon size={20} color="#f44336" />
                Security Alerts
              </div>
              {alerts.length > 0 && (
                <button
                  onClick={() => { setAlerts([]); localStorage.setItem('alerts', '[]'); }}
                  style={{ background: 'none', border: '1px solid #ddd', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 12, color: '#888' }}
                >
                  Clear All
                </button>
              )}
            </div>
            {alerts.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 16, padding: 40, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ width: 64, height: 64, background: '#e8f5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Icons.ShieldCheckIcon size={32} color="#2e7d32" />
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>All Clear</div>
                <p style={{ color: '#888', fontSize: 14, margin: 0 }}>No active security alerts. All bikes are secure.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {alerts.map((a, idx) => (
                  <div key={idx} style={{
                    background: '#fff5f5',
                    border: '2px solid #ffcdd2',
                    borderLeft: '5px solid #f44336',
                    borderRadius: 12,
                    padding: 16,
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ width: 40, height: 40, background: '#ffebee', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icons.AlertTriangleIcon size={20} color="#f44336" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#c62828', marginBottom: 2 }}>ANTI-THEFT ALERT — Bike {a.bikeId}</div>
                      <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>{a.message}</div>
                      <div style={{ fontSize: 11, color: '#aaa' }}>{new Date(a.time).toLocaleString()}</div>
                    </div>
                    <button
                      onClick={() => {
                        const updated = alerts.filter((_, i) => i !== idx);
                        setAlerts(updated);
                        localStorage.setItem('alerts', JSON.stringify(updated));
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 4 }}
                    >
                      <Icons.XIcon size={16} color="#aaa" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>

      {selectedUser && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, maxWidth: 400, maxHeight: "80vh", overflow: "auto", boxShadow: "0 10px 40px rgba(0,0,0,0.3)" }}>
            {zoomSrc && (
              <div onClick={() => setZoomSrc(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, cursor: 'pointer' }}>
                <img src={zoomSrc} style={{ maxWidth: '90%', maxHeight: '90%' }} />
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontSize: 18 }}>Verification Photos</h3>
              <button onClick={() => setSelectedUser(null)} style={{ background: "none", border: "none", cursor: "pointer", display: 'flex' }}>
                <Icons.XIcon size={24} color="#888" />
              </button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Applicant: <strong>{selectedUser.name}</strong></div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>Email: <strong>{selectedUser.email}</strong></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {selectedUser.uploads ? Object.entries(selectedUser.uploads).map(([key, img]) => (
                  img ? (
                    <div key={key} style={{ borderRadius: 8, overflow: "hidden", background: "#f0f0f0", border: "2px solid #e0e0e0" }}>
                      <img src={img} alt={key} onClick={() => setZoomSrc(img)} style={{ width: "100%", height: 150, objectFit: "contain", padding: 8, cursor: 'pointer' }} />
                      <div style={{ fontSize: 10, textAlign: "center", padding: "8px 4px", background: "#f8f8f8", fontWeight: 600, color: "#666" }}>{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    </div>
                  ) : null
                )) : (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 20, color: "#888" }}>No photos found</div>
                )}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              {selectedUser.note && <p style={{ fontSize: 12, color: '#333', marginBottom: 8 }}>Previous note: {selectedUser.note}</p>}
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Enter note for user" style={{ width: "100%", minHeight: 80, padding: 8, marginBottom: 8 }} />
              <button onClick={() => { handleSendNote(selectedUser.email, noteText); setNoteText(''); alert('Note sent'); }} style={{ background: LIME, color: DARK, border: "none", borderRadius: 6, padding: "8px 12px", cursor: "pointer", fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.MessageSquareIcon size={14} style={{ marginRight: 6 }} />Send Note</button>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => handleApproveUser(selectedUser.email)} style={{ flex: 1, background: "#4CAF50", color: "white", border: "none", borderRadius: 8, padding: 12, cursor: "pointer", fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.CheckCircleIcon size={14} style={{ marginRight: 6 }} />Verify User</button>
<button onClick={() => handleRejectUser(selectedUser.email)} style={{ flex: 1, background: "#f44336", color: "white", border: "none", borderRadius: 8, padding: 12, cursor: "pointer", fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.XCircleIcon size={14} style={{ marginRight: 6 }} />Reject User</button>
            </div>
          </div>
        </div>
      )}

      {/* bottom logout button placed outside header for clean layout */}
      <div style={{ marginTop: 'auto', padding: '12px 24px', background: 'white', borderTop: '1px solid #eee' }}>
        <button onClick={handleLogout} className="btn-secondary" style={{ width: '100%', padding: '8px 0' }}>Logout</button>
      </div>
    </div>
  );
}