import React, { useContext, useEffect, useState } from "react";
import { SearchContext } from "../components/AdminLayout.jsx";
import { MapPin } from "lucide-react";
import { db } from "../../firebase.js";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const STATUS_STYLES = {
  completed: "bg-emerald-500/10 text-emerald-400",
  active:    "bg-[#CCFF00]/10 text-[#aadf00]",
};

export default function TripsPage() {
  const { search } = useContext(SearchContext);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "trips"), orderBy("start", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setTrips(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const filtered = (trips || []).filter(t =>
    (t.user || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.bike || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.id || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">Trips</h1>
        <p className="text-gray-500 text-sm mt-1">{(trips || []).length} total trips</p>
      </div>

      <div className="bg-[#161616] border border-white/5 rounded-2xl overflow-x-auto no-scrollbar">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {["Trip ID","User","Bike","Start","End","Duration","Cost","Status"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length > 0 ? filtered.map(t => (
              <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4 text-white font-mono text-xs font-bold">{t.id}</td>
                <td className="px-5 py-4 text-gray-300">{t.user}</td>
                <td className="px-5 py-4 text-gray-400">{t.bike}</td>
                <td className="px-5 py-4 text-gray-400">{t.start}</td>
                <td className="px-5 py-4 text-gray-400">{t.end || "—"}</td>
                <td className="px-5 py-4 text-gray-300">{t.duration}</td>
                <td className="px-5 py-4 text-gray-300">{t.cost != null ? `${t.cost.toFixed(2)} EGP` : "—"}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[t.status]}`}>
                    {t.status?.charAt(0).toUpperCase() + t.status?.slice(1)}
                  </span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={8} className="text-center py-20 text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <MapPin size={32} className="opacity-20" />
                  <span>No trip history found. New trips will appear here once users start riding.</span>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
