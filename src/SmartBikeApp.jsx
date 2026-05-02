import React, { useState, useEffect } from "react";
import './styles/main.css';
import { SCREENS } from './navigation/ScreenRegistry';
import { DAMIETTA_BIKES } from './features/telemetry/geofence';
import * as Icons from './assets/Icons.jsx';

// ── Error Boundary: prevents a white screen on any child crash ──
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App crashed:', error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0D0D0D', color: '#CCFF00', fontFamily: "'Space Grotesk', sans-serif",
          padding: 32, textAlign: 'center'
        }}>
          <div style={{ marginBottom: 20 }}>
            <Icons.AlertTriangleIcon size={64} color="#CCFF00" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: '#FFF' }}>System Error Detected</h2>
          <div style={{ 
            background: 'rgba(255, 77, 77, 0.1)', 
            border: '1px solid rgba(255, 77, 77, 0.3)',
            borderRadius: 12, padding: 16, marginBottom: 24, textAlign: 'left',
            maxWidth: '90%', overflow: 'auto'
          }}>
            <code style={{ color: '#FF4D4D', fontSize: 13, display: 'block', marginBottom: 8 }}>
              <b>Error:</b> {this.state.error?.message}
            </code>
            {this.state.errorInfo && (
              <pre style={{ color: '#888', fontSize: 11, whiteSpace: 'pre-wrap', margin: 0 }}>
                {this.state.errorInfo.componentStack.split('\n').slice(0, 3).join('\n')}
              </pre>
            )}
          </div>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{ 
              background: '#CCFF00', color: '#111', border: 'none', 
              borderRadius: 12, padding: '14px 32px', fontWeight: 800, 
              fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 15px rgba(204, 255, 0, 0.3)' 
            }}
          >
            Reboot System
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Main App ──
function App({ state, setState, screen, setScreen }) {
  // Logic here is now delegated to AppRoot
  // Persist user state to localStorage (Keep as secondary sync if needed, but handled in AppRoot)
  useEffect(() => {
    if (state.user && state.user.name) {
      localStorage.setItem('bike_app_user', JSON.stringify(state.user));
    }
  }, [state.user]);

  const isAdmin = screen === 'adminDashboard';

  // PILLAR 6: Strict Access Guard / "The Pending Lock"
  let secureScreen = screen;
  if (!isAdmin && state.user?.phone) {
    const status = (state.user.status || "").toLowerCase();
    const isVerified = status === 'verified';
    const isSafeScreen = ['welcome', 'login', 'register', 'otp', 'otpMethod', 'phoneVerified', 'scanId', 'scanComplete', 'onboard1', 'onboard2', 'onboard3', 'statusDashboard', 'needCorrection'].includes(screen);
    
    if (!isVerified && !isSafeScreen) {
      secureScreen = 'pendingApproval';
    }
  }

  const Screen = SCREENS[secureScreen] || SCREENS.splash;

  return (
    <div className="app-main-wrapper">
      {isAdmin ? (
        <div className="admin-root-container">
          <Screen navigate={setScreen} state={state} setState={setState} />
        </div>
      ) : (
        <div className="mobile-app-overlay">
          <div className="phone-frame">
            <div className="screen">
              <Screen navigate={setScreen} state={state} setState={setState} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap in ErrorBoundary before export
export default function AppWithGuard(props) {
  return (
    <ErrorBoundary>
      <App {...props} />
    </ErrorBoundary>
  );
}