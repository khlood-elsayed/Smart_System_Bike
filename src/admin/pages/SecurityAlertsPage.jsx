import React, { useState, useEffect, useRef } from "react";
import { ShieldAlert, ShieldCheck, Trash2, AlertTriangle, Clock, Bike, X } from "lucide-react";
import localforage from "localforage";

export default function SecurityAlertsPage({ state }) {
  const [alerts, setAlerts] = useState([]);
  const [bikeAlerts, setBikeAlerts] = useState([]);
  const prevBikesRef = useRef({});

  // Load persisted alerts from localforage
  useEffect(() => {
    async function load() {
      const stored = localStorage.getItem("alerts");
      try {
        const parsed = stored ? JSON.parse(stored) : [];
        setAlerts(parsed);
      } catch { setAlerts([]); }
    }
    load();
  }, []);

  // Persist alerts to localStorage on change
  useEffect(() => {
    localStorage.setItem("alerts", JSON.stringify(alerts));
  }, [alerts]);

  // Watch state.bikes for locked bikes that moved (anti-theft detection)
  useEffect(() => {
    if (!state?.bikes) return;

    const interval = setInterval(() => {
      const newBikeAlerts = [];
      state.bikes.forEach(bike => {
        const prev = prevBikesRef.current[bike.id];
        if (
          prev &&
          bike.locked && // bike is locked
          (bike.lat !== prev.lat || bike.lng !== prev.lng) // but coordinates changed
        ) {
          const alertId = `theft-${bike.id}-${Date.now()}`;
          newBikeAlerts.push({
            bikeId: bike.id,
            time: Date.now(),
            message: `Bike is LOCKED but its GPS location changed (was [${prev.lat?.toFixed(4)}, ${prev.lng?.toFixed(4)}], now [${bike.lat?.toFixed(4)}, ${bike.lng?.toFixed(4)}]). Possible theft!`,
            alertId,
          });
        }
        prevBikesRef.current[bike.id] = { lat: bike.lat, lng: bike.lng };
      });

      if (newBikeAlerts.length > 0) {
        setAlerts(a => [...newBikeAlerts, ...a]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [state?.bikes]);

  // Also load alerts from localStorage (from AdminDashboard triggerAlarm calls)
  useEffect(() => {
    const intervalId = setInterval(() => {
      try {
        const stored = localStorage.getItem("alerts");
        if (stored) {
          const parsed = JSON.parse(stored);
          setAlerts(prev => {
            const ids = new Set(prev.map(a => a.alertId || `${a.bikeId}-${a.time}`));
            const newItems = parsed.filter(a => !ids.has(a.alertId || `${a.bikeId}-${a.time}`));
            return newItems.length ? [...newItems, ...prev] : prev;
          });
        }
      } catch {}
    }, 3000);
    return () => clearInterval(intervalId);
  }, []);

  function dismissAlert(idx) {
    setAlerts(a => a.filter((_, i) => i !== idx));
  }

  function clearAll() {
    setAlerts([]);
    localStorage.setItem("alerts", "[]");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-3">
            <ShieldAlert size={26} className="text-red-400" />
            Security Alerts
          </h1>
          <p className="text-gray-500 text-sm mt-1">Live anti-theft monitoring — detects locked bikes that move</p>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium hover:bg-red-500/20 transition-all"
          >
            <Trash2 size={14} /> Clear All ({alerts.length})
          </button>
        )}
      </div>

      {/* Status bar */}
      <div className={`rounded-2xl border p-4 flex items-center gap-4 ${alerts.length > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-[#161616] border-white/5'}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${alerts.length > 0 ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
          {alerts.length > 0
            ? <AlertTriangle size={22} className="text-red-400" />
            : <ShieldCheck size={22} className="text-green-400" />
          }
        </div>
        <div>
          <div className={`font-bold text-base font-['Space_Grotesk'] ${alerts.length > 0 ? 'text-red-300' : 'text-green-300'}`}>
            {alerts.length > 0 ? `${alerts.length} Active Alert${alerts.length > 1 ? 's' : ''}` : 'All Clear'}
          </div>
          <div className="text-gray-500 text-sm">
            {alerts.length > 0 ? 'Immediate action required — check the bikes below.' : 'No active security alerts. All bikes are secure.'}
          </div>
        </div>
      </div>

      {/* Alerts list */}
      {alerts.length === 0 ? (
        <div className="bg-[#161616] border border-white/5 rounded-2xl p-16 text-center">
          <ShieldCheck size={48} className="text-green-400 mx-auto mb-4" />
          <div className="text-white font-bold text-lg font-['Space_Grotesk'] mb-2">No Security Alerts</div>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">The system will auto-detect any locked bikes that move or vibration sensor events.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className="bg-red-500/5 border border-red-500/30 rounded-2xl p-5 flex items-start gap-4"
              style={{ borderLeft: '4px solid #ef4444' }}
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bike size={18} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-red-300 font-bold text-sm font-['Space_Grotesk'] mb-1">
                  ANTI-THEFT ALERT — Bike {alert.bikeId}
                </div>
                <div className="text-gray-300 text-sm mb-2 leading-relaxed">{alert.message}</div>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <Clock size={11} />
                  {new Date(alert.time).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => dismissAlert(idx)}
                className="text-gray-600 hover:text-white transition-colors p-1 shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Live bike status overview */}
      {state?.bikes && state.bikes.length > 0 && (
        <div className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center gap-2">
            <Bike size={16} className="text-[#CCFF00]" />
            <h3 className="font-bold text-white font-['Space_Grotesk'] text-sm">Live Bike Status</h3>
          </div>
          <div className="divide-y divide-white/5">
            {state.bikes.slice(0, 8).map(bike => (
              <div key={bike.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-white font-medium">{bike.id}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Battery: {bike.battery ?? '--'}% · {bike.zone || 'Unknown Zone'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    bike.locked
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-[#CCFF00]/10 text-[#CCFF00]'
                  }`}>
                    {bike.locked ? '🔒 Locked' : '🔓 Unlocked'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    bike.status === 'Available'
                      ? 'bg-green-500/10 text-green-400'
                      : bike.status === 'In Use' || bike.status === 'active'
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'bg-orange-500/10 text-orange-400'
                  }`}>
                    {bike.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
