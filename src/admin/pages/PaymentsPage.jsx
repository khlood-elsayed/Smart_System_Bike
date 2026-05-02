import React, { useContext, useEffect, useState } from "react";
import { SearchContext } from "../components/AdminLayout.jsx";
import { CreditCard } from "lucide-react";
import { db } from "../../firebase.js";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const STATUS_STYLES = {
  success: "bg-emerald-500/10 text-emerald-400",
  failed:  "bg-red-500/10 text-red-400",
  pending: "bg-orange-500/10 text-orange-400",
};
const METHOD_ICONS = { Wallet: "💳", Card: "🏦", Fawry: "🧾" };

export default function PaymentsPage() {
  const { search } = useContext(SearchContext);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "payments"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const filtered = (payments || []).filter(p =>
    (p.user || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.id || "").toLowerCase().includes(search.toLowerCase())
  );

  const total = (payments || []).filter(p => p.status === 'success').reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">Payments</h1>
          <p className="text-gray-500 text-sm mt-1">{(payments || []).length} transactions</p>
        </div>
        <div className="bg-[#161616] border border-white/5 rounded-2xl px-5 py-3 text-right">
          <div className="text-xs text-gray-500">Total Collected</div>
          <div className="text-xl font-bold text-[#CCFF00] font-['Space_Grotesk']">{total.toFixed(2)} EGP</div>
        </div>
      </div>

      <div className="bg-[#161616] border border-white/5 rounded-2xl overflow-x-auto no-scrollbar">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {["Payment ID","User","Amount","Method","Status","Date"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length > 0 ? filtered.map(p => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4 text-white font-mono text-xs font-bold">{p.id}</td>
                <td className="px-5 py-4 text-gray-300">{p.user}</td>
                <td className="px-5 py-4 text-white font-semibold">{(p.amount || 0).toFixed(2)} EGP</td>
                <td className="px-5 py-4 text-gray-400">{METHOD_ICONS[p.method] || ''} {p.method}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[p.status]}`}>
                    {p.status?.charAt(0).toUpperCase() + p.status?.slice(1)}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-400 text-xs">{p.date}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="text-center py-20 text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <CreditCard size={32} className="opacity-20" />
                  <span>No payment records found. Real-time data will sync once the gateway is connected.</span>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
