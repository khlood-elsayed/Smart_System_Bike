import React from "react";
import { X, Bike } from "lucide-react";

export default function ViewBikeModal({ bike, onClose }) {
  if (!bike) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-7 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#CCFF00]/10 rounded-full flex items-center justify-center">
              <Bike size={20} className="text-[#CCFF00]" />
            </div>
            <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">Bike Details: {bike.id}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
            <X size={24}/>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-bold">RFID Tag</div>
            <div className="text-white font-mono">{bike.rfid}</div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-bold">Current Zone</div>
            <div className="text-white">{bike.zone}</div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-bold">Latitude</div>
            <div className="text-white text-sm">{bike.lat?.toFixed(6)}</div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-bold">Longitude</div>
            <div className="text-white text-sm">{bike.lng?.toFixed(6)}</div>
          </div>
        </div>

        <div className="bg-white/5 p-5 rounded-xl border border-white/5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-400 text-sm font-bold">Battery Health</div>
            <div className="text-[#CCFF00] font-bold text-lg">{Math.min(bike.battery, 100)}%</div>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#CCFF00] rounded-full transition-all duration-500" style={{ width: `${Math.min(bike.battery, 100)}%` }} />
          </div>
          <div className="flex justify-between mt-3 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <span>Critical</span>
            <span>Optimal</span>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="w-full py-3.5 rounded-xl bg-[#CCFF00] text-[#111] font-bold hover:brightness-110 active:scale-[0.98] transition-all"
        >
          Close View
        </button>
      </div>
    </div>
  );
}
