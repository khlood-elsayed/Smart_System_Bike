import React, { useState } from "react";
import localforage from 'localforage';
import { DARK, LIME } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default function NeedCorrectionScreen({ navigate, state, setState }) {
  const [formData, setFormData] = useState({
    first: state.user?.first || '',
    last: state.user?.last || '',
    nid: state.user?.nid || '',
    phone: state.user?.phone || ''
  });
  const [editingField, setEditingField] = useState(null);
  const [loading, setLoading] = useState(false);
  const photos = state.user?.uploads || {};

  const handleTextChange = (field, val) => setFormData(p => ({ ...p, [field]: val }));

  const submitReevaluation = async () => {
    setLoading(true);
    try {
      const currentUsers = await localforage.getItem('app_users') || [];
      const updatedUser = {
        ...state.user,
        ...formData,
        name: `${formData.first} ${formData.last}`.trim(),
        status: 'pending', // Revert to pending for Admin re-evaluation
        correctionReason: null,
        updatedFields: {
          first: formData.first !== state.user.first,
          last: formData.last !== state.user.last,
          nid: formData.nid !== state.user.nid,
          phone: formData.phone !== state.user.phone
        }
      };
      
      const idx = currentUsers.findIndex(u => u.phone === state.user.phone);
      if (idx !== -1) {
        currentUsers[idx] = updatedUser;
        await localforage.setItem('app_users', currentUsers);
      }
      
      localStorage.setItem('bike_app_user', JSON.stringify(updatedUser));
      if (setState) setState(s => ({ ...s, user: updatedUser }));
      
      // Navigate cleanly out to Pending Approval lock
      navigate('pendingApproval');
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const FieldRow = ({ label, value, field, icon }) => (
    <div style={{ background: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
         <div style={{ color: '#888' }}>{icon}</div>
         <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
            {editingField === field ? (
              <input 
                autoFocus
                type="text" 
                value={value} 
                onChange={e => handleTextChange(field, e.target.value)}
                onBlur={() => setEditingField(null)}
                style={{ background: 'transparent', border: 'none', borderBottom: '2px solid #000', outline: 'none', fontSize: 16, fontWeight: 700, color: DARK, width: '100%', marginTop: 4, paddingBottom: 2 }}
              />
            ) : (
              <div style={{ fontSize: 16, fontWeight: 700, color: DARK, marginTop: 4 }}>{value || 'Not provided'}</div>
            )}
         </div>
      </div>
      <button onClick={() => setEditingField(field)} style={{ padding: '8px 4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#007AFF' }}>
         <Icons.EditProfileIcon size={18} />
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "white", padding: "20px 24px 24px", display: "flex", flexDirection: "column" }}>
      <StatusBar />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <BackBtn onBack={() => navigate('statusDashboard')} />
        <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", margin: 0 }}>Review & Edit</h2>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 20 }} className="no-scrollbar">
        <div style={{ background: "#fff3cd", border: "1px solid #ffe69c", padding: 16, borderRadius: 12, marginBottom: 24, boxShadow: "0 4px 12px rgba(255,152,0,0.1)" }}>
          <div style={{ fontWeight: 700, color: "#ff6b35", fontSize: 13, marginBottom: 6, display: "flex", alignItems: "center", gap: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <Icons.AlertTriangleIcon size={16} color="#ff6b35" />
            Admin Note
          </div>
          <div style={{ color: "#555", fontSize: 13, lineHeight: 1.5, fontWeight: 500 }}>
            {state.user?.correctionReason || "Please fix your application and resubmit."}
          </div>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, fontFamily: "'Space Grotesk',sans-serif" }}>Personal Info</h3>
        <FieldRow label="First Name" field="first" value={formData.first} icon={<Icons.UserIcon size={20} />} />
        <FieldRow label="Last Name" field="last" value={formData.last} icon={<Icons.UserIcon size={20} />} />
        <FieldRow label="National ID" field="nid" value={formData.nid} icon={<Icons.IdCardIcon size={20} />} />
        <FieldRow label="Phone" field="phone" value={formData.phone} icon={<Icons.PhoneIcon size={20} />} />

        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, marginTop: 24, fontFamily: "'Space Grotesk',sans-serif" }}>Document Photos</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { key: 'idFront', label: 'ID Front' },
            { key: 'idBack', label: 'ID Back' },
            { key: 'faceScan', label: 'Face Scan' },
            { key: 'selfie', label: 'Selfie Mode' }
          ].map((photo, idx) => (
            <div key={photo.key} style={{ background: '#f5f5f5', borderRadius: 12, overflow: 'hidden' }}>
                <img src={photos[photo.key] || 'https://via.placeholder.com/150'} style={{ width: '100%', height: 110, objectFit: 'cover' }} alt={photo.label} />
                <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#333' }}>{photo.label}</span>
                  <button onClick={() => { sessionStorage.setItem('scanId_step', idx.toString()); navigate('scanId'); }} style={{ background: '#ff6b3515', border: 'none', color: '#ff6b35', fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase' }}>Re-take</button>
                </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 16, background: 'white' }}>
        <button 
          className="btn-primary" 
          onClick={submitReevaluation} 
          disabled={loading} 
          style={{ width: '100%', height: 56, background: '#111', color: LIME, border: `2px solid ${LIME}`, fontSize: 16 }}
        >
          {loading ? 'Submitting...' : 'Submit to Admin'}
        </button>
      </div>
    </div>
  );
}
