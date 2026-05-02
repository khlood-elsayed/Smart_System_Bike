import React, { useState, useContext, useEffect } from "react";
import * as Icons from "../../assets/Icons.jsx";
import { SearchContext } from "../components/AdminLayout.jsx";
import ViewBikeModal from "../components/ViewBikeModal.jsx";
import { doc, updateDoc, deleteDoc, setDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { logAdminAction } from "../utils/logger.js";

// ── Status Constants ──
const STATUS_STYLE = {
  available:   "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  active:      "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
  low_battery: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  offline:     "bg-red-500/10 text-red-400 border border-red-500/20",
};

const ZONES_COORDS = {
  "Zone A": { lat: 31.4175, lng: 31.8144 },
  "Zone B": { lat: 31.4220, lng: 31.8200 },
  "Zone C": { lat: 31.4100, lng: 31.8080 }
};

const ZONES = ["All", "Zone A", "Zone B", "Zone C"];
const STATUSES = ["All", "available", "active", "low_battery", "offline"];

// ── Sub-Components ──

function LCDModal({ dock, onClose, onSend }) {
  const [msg, setMsg] = useState("");
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">Remote LCD Link</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-white transition-all">
            <Icons.XIcon size={18} />
          </button>
        </div>
        <div className="mb-4 p-4 bg-white/5 border border-white/5 rounded-xl">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Target Dock</div>
          <div className="text-white font-bold">{dock.name} ({dock.id})</div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1.5 font-medium">New Message</label>
            <textarea 
              autoFocus
              value={msg} 
              onChange={e => setMsg(e.target.value)}
              placeholder="Enter text to display..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#007AFF]/50 resize-none h-24" 
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm font-bold bg-transparent">Cancel</button>
            <button 
              onClick={() => { onSend(dock.id, msg); onClose(); }} 
              className="flex-1 py-3 rounded-xl bg-[#007AFF] text-white font-bold flex items-center justify-center gap-2"
            >
              <Icons.ZapIcon size={16} /> Send to ESP32
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddBikeModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ id: "", rfid: "", zone: "Zone A", voltage: 4.2 });
  function submit(e) {
    e.preventDefault();
    if (!form.id || !form.rfid) return;
    const center = ZONES_COORDS[form.zone] || ZONES_COORDS["Zone A"];
    const lat = center.lat + (Math.random() - 0.5) * 0.001;
    const lng = center.lng + (Math.random() - 0.5) * 0.001;
    onAdd({ ...form, status: 'available', locked: true, lat, lng });
    onClose();
  }
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">Add New Bike</h2>
          <button onClick={onClose} className="p-2 -mr-2 bg-white/0 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
            <Icons.XIcon size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1.5 font-medium">Bike ID</label>
            <input required value={form.id} onChange={e => setForm(f=>({...f,id:e.target.value}))}
              placeholder="BK-701"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#CCFF00]/50" />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1.5 font-medium">RFID Tag</label>
            <input required value={form.rfid} onChange={e => setForm(f=>({...f,rfid:e.target.value}))}
              placeholder="RF-X99"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#CCFF00]/50" />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1.5 font-medium">Deployment Zone</label>
            <select value={form.zone} onChange={e => setForm(f=>({...f,zone:e.target.value}))}
              className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#CCFF00]/50">
              {ZONES.filter(z => z !== 'All').map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm font-bold hover:text-white transition-all bg-transparent">Cancel</button>
            <button type="submit" className="flex-1 py-3 rounded-xl bg-[#CCFF00] text-[#111] font-bold">Save Bike</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditBikeModal({ bike, onClose, onEdit }) {
  const [form, setForm] = useState({ ...bike, voltage: bike.voltage || 4.2 });
  function submit(e) {
    e.preventDefault();
    onEdit(form);
    onClose();
  }
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">Edit Bike</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <Icons.XIcon size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1.5 font-medium">Bike ID</label>
            <input required value={form.id} onChange={e => setForm(f=>({...f,id:e.target.value}))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#CCFF00]/50" />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1.5 font-medium">Voltage (V)</label>
            <input type="number" step="0.1" value={form.voltage} onChange={e => setForm(f=>({...f,voltage:parseFloat(e.target.value)}))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#CCFF00]/50" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm font-bold hover:text-white transition-all bg-transparent">Cancel</button>
            <button type="submit" className="flex-1 py-3 rounded-xl bg-[#CCFF00] text-[#111] font-bold">Update Bike</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ bike, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
            <Icons.TrashIcon size={28} color="#F44336" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] mb-1">Delete Bike</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Are you sure you want to delete <span className="text-white font-bold">{bike?.id}</span>?
            </p>
          </div>
          <div className="flex gap-3 w-full pt-2">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm font-bold bg-transparent">Cancel</button>
            <button onClick={() => { onConfirm(bike.id); onClose(); }} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all">Confirm Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200]">
      <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border ${
        type === 'error' ? 'bg-red-500/90 border-red-500/20 text-white' : 'bg-[#1a1a1a]/95 border-[#CCFF00]/30 text-[#CCFF00]'
      }`}>
        {type === 'error' ? <Icons.XCircleIcon size={18} color="#fff" /> : <Icons.CheckCircleIcon size={18} color="#CCFF00" />}
        <div className="font-bold font-['Space_Grotesk'] text-sm">{message}</div>
        <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100 transition-opacity"><Icons.XIcon size={16} /></button>
      </div>
    </div>
  );
}

// ── Main Component ──

export default function BikesPage({ bikes = [], docks = [], setBikes }) {
  const { search } = useContext(SearchContext);
  const [activeTab, setActiveTab] = useState('bikes'); // 'bikes' | 'docks'
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterZone, setFilterZone] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBike, setEditingBike] = useState(null);
  const [selectedBikeDetails, setSelectedBikeDetails] = useState(null);
  const [deletingBike, setDeletingBike] = useState(null);
  const [lcdTarget, setLcdTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const filteredBikes = bikes.filter(b => {
    if (!b) return false;
    const matchSearch = (b.id || "").toLowerCase().includes(search.toLowerCase()) || 
                       (b.rfid || "").toLowerCase().includes(search.toLowerCase()) || 
                       (b.zone || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || b.status === filterStatus;
    const matchZone   = filterZone === "All"   || b.zone === filterZone;
    return matchSearch && matchStatus && matchZone;
  });

  const filteredDocks = docks.filter(d => {
    if (!d) return false;
    return (d.id || "").toLowerCase().includes(search.toLowerCase());
  });

  const toggleBikeLock = async (id) => {
    try {
      const b = bikes.find(x => x.id === id);
      if (!b) return;
      const newLocked = !b.locked;
      const bikeRef = doc(db, "bikes", id);
      
      await updateDoc(bikeRef, { 
        locked: newLocked, 
        status: newLocked ? 'available' : 'active' 
      });
      
      logAdminAction(newLocked ? "Lock Bike" : "Unlock Bike", `Bike ${id} ${newLocked ? 'locked' : 'unlocked'}`);
      showToast(`Bike ${id} ${newLocked ? 'Locked' : 'Unlocked'} successfully`);
    } catch (err) {
      showToast("Failed to toggle lock", "error");
    }
  };

  const handleDelete = (bike) => setDeletingBike(bike);
  const confirmDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "bikes", id));
      logAdminAction("Delete Bike", `Bike ${id} deleted permanently`);
      showToast(`Bike ${id} deleted successfully`);
      setDeletingBike(null);
    } catch (err) {
      showToast("Failed to delete bike", "error");
    }
  };

  const handleUpdateBike = async (updated) => {
    try {
      await updateDoc(doc(db, "bikes", editingBike.id), updated);
      setEditingBike(null);
      logAdminAction("Update Bike", `Bike ${updated.id} parameters updated`);
      showToast(`Bike ${updated.id} updated successfully`);
    } catch (err) {
      showToast("Failed to update bike", "error");
    }
  };

  const handleAddBike = async (newBike) => {
    try {
      await setDoc(doc(db, "bikes", newBike.id), newBike);
      setShowAddModal(false);
      logAdminAction("Add Bike", `New Bike ${newBike.id} deployed to ${newBike.zone}`);
      showToast(`Bike ${newBike.id} added successfully`);
    } catch (err) {
      showToast("Failed to add bike", "error");
    }
  };

  const setDocks = (nd) => setState(s => ({ ...s, docks: nd }));

  const handleSendLCD = async (id, text) => {
    try {
      await updateDoc(doc(db, "docks", id), { lcdMessage: text });
      logAdminAction("Remote LCD", `Message sent to ${id}: "${text}"`);
      showToast(`Message sent to ${id} LCD`);
    } catch (err) {
      showToast("Failed to send LCD message", "error");
    }
  };

  return (
    <div className="space-y-6 relative h-full">
      {/* Modals & Toasts */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showAddModal && <AddBikeModal onClose={() => setShowAddModal(false)} onAdd={handleAddBike} />}
      {editingBike && <EditBikeModal bike={editingBike} onClose={() => setEditingBike(null)} onEdit={handleUpdateBike} />}
      {selectedBikeDetails && <ViewBikeModal bike={selectedBikeDetails} onClose={() => setSelectedBikeDetails(null)} />}
      {deletingBike && <ConfirmDeleteModal bike={deletingBike} onClose={() => setDeletingBike(null)} onConfirm={confirmDelete} />}
      {lcdTarget && <LCDModal dock={lcdTarget} onClose={() => setLcdTarget(null)} onSend={handleSendLCD} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">Hardware Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">{bikes.length} bikes, {docks.length} mapping docks</p>
        </div>
        {activeTab === 'bikes' && (
          <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 bg-[#CCFF00] text-[#111] font-bold rounded-xl flex items-center gap-2 hover:brightness-110 transition-all">
            <Icons.PlusIcon size={18} /> Add Bike
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-4">
        <button onClick={() => setActiveTab('bikes')} className={`text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${activeTab === 'bikes' ? 'border-[#CCFF00] text-[#CCFF00]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
          Active Bikes
        </button>
        <button onClick={() => setActiveTab('docks')} className={`text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${activeTab === 'docks' ? 'border-[#CCFF00] text-[#CCFF00]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
          Docking Stations
        </button>
      </div>

      {/* Filters (Bikes Only) */}
      {activeTab === 'bikes' && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#161616] border border-white/10 rounded-xl px-3 py-2">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Status</span>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="bg-transparent text-gray-300 text-sm focus:outline-none">
              {STATUSES.map(s => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-[#161616] border border-white/10 rounded-xl px-3 py-2">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Zone</span>
            <select value={filterZone} onChange={e => setFilterZone(e.target.value)}
              className="bg-transparent text-gray-300 text-sm focus:outline-none">
              {ZONES.map(z => <option key={z} value={z}>{z === "All" ? "All Zones" : z}</option>)}
            </select>
          </div>
          <span className="ml-auto text-sm text-gray-500">{filteredBikes.length} bikes showing</span>
        </div>
      )}

      {/* Table Content */}
      <div className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          {activeTab === 'bikes' ? (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Bike ID</th>
                  <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Status</th>
                  <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Power / Battery</th>
                  <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Location / Dock</th>
                  <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Zone</th>
                  <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Security (Vibration)</th>
                  <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBikes.map(bike => {
                  const isTheft = bike.theftAlert === true;
                  const v = bike.voltage || 4.2;
                  
                  return (
                    <tr key={bike.id} className={`transition-colors group ${isTheft ? 'bg-red-500/10' : 'hover:bg-white/[0.02]'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isTheft ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-[#CCFF00]'}`}>
                            <Icons.BikeIconSVG size={16} />
                          </div>
                          <span className={`${isTheft ? 'text-red-400' : 'text-white'} font-bold font-['Space_Grotesk']`}>{bike.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${STATUS_STYLE[bike.status] || STATUS_STYLE.available}`}>
                          {bike.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${v < 3.2 ? 'text-red-500' : 'text-emerald-400'}`}>{v.toFixed(1)}V</span>
                          </div>
                          {v < 3.2 && (
                            <span className="text-[10px] text-red-500 font-bold bg-red-500/20 px-2 py-0.5 rounded-sm w-max uppercase outline outline-1 outline-red-500/50">Critical: Charging Required</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {(() => {
                            const d = docks.find(dk => dk.occupiedBy === bike.id);
                            return d ? (
                              <>
                                <div className="flex items-center gap-1 text-blue-400 font-bold text-[11px]">
                                  <Icons.LocationIcon size={12} /> {d.id}
                                </div>
                                <div className="text-[10px] text-gray-500">{d.name}</div>
                              </>
                            ) : (
                              <span className="text-gray-500 italic text-xs">On Trip / Independent</span>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{bike.zone || (Math.random() > 0.5 ? 'Zone A' : 'Zone B')}</td>
                      <td className="px-6 py-4">
                        {isTheft ? (
                          <div className="flex items-center gap-1.5 animate-pulse">
                            <Icons.ShieldAlertIcon size={16} color="#ef4444" />
                            <span className="text-xs font-bold text-red-500 uppercase">THEFT ALERT (MPU6050)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {bike.locked ? <Icons.LockIcon size={14} color="#f97316" /> : <Icons.UnlockIcon size={14} color="#10b981" />}
                            <span className={`text-[11px] font-bold ${bike.locked ? 'text-orange-400' : 'text-emerald-400'}`}>
                              {bike.locked ? 'LOCKED / SECURE' : 'UNLOCKED / ACTIVE'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setSelectedBikeDetails(bike)} className="p-2 rounded-lg bg-white/5 hover:bg-[#CCFF00]/20 text-gray-400 hover:text-[#CCFF00] transition-all">
                            <Icons.EyeIcon size={16} />
                          </button>
                          <button onClick={() => setEditingBike(bike)} className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-all">
                            <Icons.PencilIcon size={16} />
                          </button>
                          <button onClick={() => toggleBikeLock(bike.id)} className="p-2 rounded-lg bg-white/5 hover:bg-orange-500/20 text-gray-400 hover:text-orange-400 transition-all">
                            {bike.locked ? <Icons.UnlockIcon size={16} /> : <Icons.LockIcon size={16} />}
                          </button>
                          <button onClick={() => handleDelete(bike)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-500 transition-all">
                            <Icons.TrashIcon size={16} color="#F44336" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Dock ID</th>
                  <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Location</th>
                  <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Power / Voltage</th>
                  <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Status</th>
                  <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Servo Position</th>
                  <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Current LCD Status</th>
                  <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDocks.map(dock => {
                  const v = dock.voltage || 4.2;
                  return (
                  <tr key={dock.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400">
                          <Icons.LocationIcon size={16} />
                        </div>
                        <span className="text-white font-bold font-['Space_Grotesk']">{dock.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">{dock.lat}, {dock.lng}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${v < 3.2 ? 'text-red-500' : 'text-emerald-400'}`}>{v.toFixed(1)}V</span>
                        </div>
                        {v < 3.2 && (
                          <span className="text-[10px] text-red-500 font-bold bg-red-500/20 px-2 py-0.5 rounded-sm w-max uppercase outline outline-1 outline-red-500/50">Critical: Charging Required</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {dock.occupiedBy ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">Occupied ({dock.occupiedBy})</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Empty</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-[60px] h-[3px] bg-white/10 relative rounded-full overflow-hidden">
                          <div className={`absolute top-0 bottom-0 left-0 transition-all ${dock.servoPos >= 90 ? 'bg-orange-500 w-full' : 'bg-emerald-500 w-full'}`}></div>
                        </div>
                        <span className={`text-xs font-bold ${dock.servoPos >= 90 ? 'text-orange-500' : 'text-emerald-500'}`}>
                          {dock.servoPos >= 90 ? 'Locked (Closed)' : 'Unlocked (Open)'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-[150px]">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-gray-300 text-xs italic truncate" title={dock.lcdMessage}>"{dock.lcdMessage || 'Static message'}"</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setLcdTarget(dock)}
                        className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 text-[11px] font-bold uppercase tracking-[0.5px] transition-all group-hover:text-white"
                      >
                        Send Msg
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
