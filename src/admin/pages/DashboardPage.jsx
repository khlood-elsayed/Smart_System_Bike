import React, { useEffect, useRef, useState } from "react";
import { Users, Bike, Activity, DollarSign, AlertTriangle, Clock } from "lucide-react";
import { db } from "../../firebase.js";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const STATUS_COLOR = {
  available:   "bg-[#CCFF00]",
  active:      "bg-cyan-400", // Active = Blue/Cyan
  low_battery: "bg-orange-400",
  offline:     "bg-red-500",
};
const SEVERITY_COLOR = {
  warning: "text-orange-400 bg-orange-400/10",
  error:   "text-red-400 bg-red-400/10",
};

function StatCard({ label, value, Icon, accent }) {
  return (
    <div className="bg-[#161616] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon size={22} className="text-[#111]" />
      </div>
      <div>
        <div className="text-2xl font-bold text-white font-['Space_Grotesk']">{typeof value === 'number' && value > 999 ? value.toLocaleString() : value}</div>
        <div className="text-gray-500 text-sm mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function LiveMap({ bikes = [] }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (instanceRef.current || !mapRef.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [31.4175, 31.8144],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const statusColors = { available: '#CCFF00', active: '#22d3ee', low_battery: '#f97316', offline: '#ef4444' };

    bikes.forEach(bike => {
      const color = statusColors[bike.status] || '#888';
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #111;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;">
          <span style="transform:rotate(45deg);font-size:10px;font-weight:700;color:#111;">${bike.id.split('-')[1]}</span>
        </div>`,
        iconAnchor: [14, 28],
      });
      L.marker([bike.lat, bike.lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${bike.id}</b><br>Status: ${bike.status}<br>Battery: ${bike.battery}%<br>Zone: ${bike.zone}`);
    });

    instanceRef.current = map;
    return () => { map.remove(); instanceRef.current = null; };
  }, []);

  return (
    <div className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <h3 className="font-bold text-white font-['Space_Grotesk']">Live Bike Map</h3>
        <div className="flex items-center gap-3 text-xs">
          {[["available","Available","#CCFF00"],["active","Active","#22d3ee"],["low_battery","Low Battery","#f97316"],["offline","Offline","#ef4444"]].map(([,l,c]) => (
            <span key={l} className="flex items-center gap-1.5 text-gray-400">
              <span style={{background:c}} className="w-2.5 h-2.5 rounded-full inline-block" />{l}
            </span>
          ))}
        </div>
      </div>
      <div ref={mapRef} style={{ height: '40vh', minHeight: '300px' }} />
    </div>
  );
}

export default function DashboardPage() {
  const [bikes, setBikes] = useState([]);
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const unsubBikes = onSnapshot(collection(db, "bikes"), (snap) => setBikes(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTrips = onSnapshot(query(collection(db, "trips"), orderBy("start", "desc")), (snap) => setTrips(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubAlerts = onSnapshot(collection(db, "alerts"), (snap) => setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubBikes(); unsubUsers(); unsubTrips(); unsubAlerts(); };
  }, []);

  const liveTrips = trips.filter(t => t.status === 'active');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time overview of the Smart Bike network</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Users"    value={users.length}    Icon={Users}    accent="bg-[#CCFF00]" />
        <StatCard label="Total Bikes"    value={bikes.length}    Icon={Bike}     accent="bg-cyan-400" />
        <StatCard label="Active Rides"   value={bikes.filter(b => b.status === 'active').length}   Icon={Activity} accent="bg-[#CCFF00]/40" />
        <StatCard label="Today's Revenue" value={`${(0).toLocaleString()} EGP`} Icon={DollarSign} accent="bg-orange-400" />
      </div>

      {/* Map */}
      <div className="overflow-x-auto">
        <LiveMap bikes={bikes} />
      </div>

      {/* Bottom tables */}
      <div className="grid grid-cols-2 gap-6">
        {/* Live Trips */}
        <div className="bg-[#161616] border border-white/5 rounded-2xl">
          <div className="p-4 border-b border-white/5 flex items-center gap-2">
            <Activity size={16} className="text-[#CCFF00]" />
            <h3 className="font-bold text-white font-['Space_Grotesk'] text-sm">Live Trips</h3>
            <span className="ml-auto bg-[#CCFF00]/10 text-[#CCFF00] text-xs font-bold px-2 py-0.5 rounded-full">{liveTrips.length} active</span>
          </div>
          <div className="divide-y divide-white/5">
            {trips.length > 0 ? trips.slice(0,5).map(t => (
              <div key={t.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-white font-medium">{t.user}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t.bike} · {t.start}</div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.status === 'active' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-gray-400'}`}>
                  {t.status === 'active' ? '🔵 Active' : `${t.duration}`}
                </span>
              </div>
            )) : (
              <div className="p-10 text-center text-gray-500 text-sm">No active trips currently.</div>
            )}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-[#161616] border border-white/5 rounded-2xl">
          <div className="p-4 border-b border-white/5 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-400" />
            <h3 className="font-bold text-white font-['Space_Grotesk'] text-sm">Recent Alerts</h3>
          </div>
          <div className="divide-y divide-white/5">
            {alerts.length > 0 ? alerts.map(a => (
              <div key={a.id} className="px-4 py-3 flex items-start gap-3">
                <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${a.severity === 'error' ? 'bg-red-400' : 'bg-orange-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">{a.message}</div>
                </div>
                <span className="text-xs text-gray-500 shrink-0 flex items-center gap-1">
                  <Clock size={11} />{a.time}
                </span>
              </div>
            )) : (
              <div className="p-10 text-center text-gray-500 text-sm">All systems normal. No recent alerts.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
