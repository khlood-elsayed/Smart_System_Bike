import React, { useState, useEffect, useRef } from "react";
import { LIME, DARK, EMERALD } from '../constants/theme.js';
import * as Icons from '../assets/Icons.jsx';
import StatusBar from '../components/common/StatusBar';
import BackBtn from '../components/common/BackBtn';

export default 
function ProfileScreen({ navigate, state, setState }) {
  // Safe user pull
  const u = state?.user || {};

  // Build full name: first + middle + last
  const fullName = [u.first, u.middle, u.last].filter(Boolean).join(' ') || u.name || 'Not Provided';
  const initials = fullName !== 'Not Provided' ? fullName.charAt(0).toUpperCase() : '?';

  // Masked NID: show first 3 chars + asterisks
  const maskedNid = u.nid ? `${String(u.nid).slice(0, 3)}${'*'.repeat(Math.max(0, String(u.nid).length - 3))}` : null;

  const [waOn, setWaOn] = useState(false);
  const [smsOn, setSmsOn] = useState(false);

  function handleLogout() {
    console.log("LOGOUT: Clearing session data and resetting state...");
    localStorage.removeItem('bike_app_user');
    localStorage.setItem('admin_mode', 'false');
    if (setState) {
      setState(s => ({
        ...s,
        user: { name: '', email: '', profilePic: '', role: '', phone: '', first: '', last: '', status: null },
        isAdminMode: false
      }));
    }
    navigate('welcome');
  }

  const fieldRow = (icon, label, value, badge, forceShow = false, onClick = null) => (value || forceShow) ? (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid #f0f0f0', cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: '#aaa', fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: DARK, marginTop: 2 }}>{value || 'Not Configured'}</div>
      </div>
      {badge}
      {onClick && <Icons.ChevronRightIcon size={16} color="#ccc" />}
    </div>
  ) : null;

  return (
    <div style={{ minHeight: '100%', background: 'white' }}>
      <StatusBar />
      <div style={{ padding: '8px 24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <BackBtn onBack={() => navigate('map')} />
          <div style={{ flex: 1, fontSize: 20, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>My Profile</div>
          <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.UserSettingsIcon size={22} color={DARK} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: u.profilePic ? 'transparent' : LIME, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", overflow: 'hidden', color: DARK, flexShrink: 0, boxShadow: `0 0 0 3px ${EMERALD}` }}>
            {u.profilePic ? <img src={u.profilePic} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", color: DARK }}>{fullName}</div>
            {u.email && <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>{u.email}</div>}
          </div>
        </div>

        <div style={{ background: '#f9f9f9', borderRadius: 16, padding: '0 16px', marginBottom: 20 }}>
          {fieldRow(
            <Icons.PhoneIcon size={18} color={DARK} />,
            'Phone Number',
            u.phone || '—',
            u.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#e8ffe8', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#2e7d32' }}>
                <Icons.ShieldCheckIcon size={13} color="#2e7d32" /> Verified
              </div>
            )
          )}
          {fieldRow(
            <Icons.IdCardIcon size={18} color={DARK} />,
            'National ID',
            maskedNid || '—',
            null
          )}
          {fieldRow(
            <Icons.WalletIcon size={18} color={DARK} />,
            'Email',
            u.email || '—',
            null
          )}
          {fieldRow(
            <Icons.PhoneIcon size={18} color="#ce1126" />,
            'Vodafone Cash',
            (u.paymentMethod?.type === 'Vodafone Cash') ? u.paymentMethod.number : null,
            !(u.paymentMethod?.type === 'Vodafone Cash') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fee2e2', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#f44336' }}>
                <Icons.AlertTriangleIcon size={12} color="#f44336" /> Add Vodafone Cash number to enable rentals
              </div>
            ),
            true, // Force show!
            () => navigate('editProfile')
          )}
        </div>

        <div style={{ background: '#f9f9f9', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
          <div className="settings-item" onClick={() => navigate('editProfile')} style={{ gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.EditProfileIcon size={18} color={DARK} />
            </div>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>Edit Profile</span>
            <Icons.ChevronRightIcon size={16} color="#ccc" />
          </div>
          <div className="settings-item" onClick={() => navigate('changePassword')} style={{ gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.KeyIcon2 size={18} color={DARK} />
            </div>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>Change Password</span>
            <Icons.ChevronRightIcon size={16} color="#ccc" />
          </div>
        </div>

        <div style={{ background: '#f9f9f9', borderRadius: 16, overflow: 'hidden', marginBottom: 28 }}>
          <div className="settings-item" style={{ gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#e8fff8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.WhatsAppIcon size={18} color="#25D366" />
            </div>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>Notifications via WhatsApp</span>
            <div className={`toggle ${waOn ? 'on' : ''}`} onClick={() => setWaOn(v => !v)} />
          </div>
          <div className="settings-item" style={{ gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#e8f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.SMSIcon size={18} color="#007AFF" />
            </div>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>Notifications via SMS</span>
            <div className={`toggle ${smsOn ? 'on' : ''}`} onClick={() => setSmsOn(v => !v)} />
          </div>
        </div>

        <button
          className="btn-danger"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%' }}
          onClick={handleLogout}
        >
          <Icons.LogOutIcon size={20} color="white" />
          Log Out
        </button>
      </div>
    </div>
  );
}