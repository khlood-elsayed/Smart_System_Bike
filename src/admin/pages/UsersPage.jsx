// import React, { useState, useContext, useEffect } from "react";
// import { SearchContext } from "../components/AdminLayout.jsx";
// import * as Icons from "../../assets/Icons.jsx";
// import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
// import { db } from '../../firebase.js';
// import { logAdminAction } from '../utils/logger.js';

// // ── Status Config ──
// const STATUS_TABS = ["All", "pending", "verified", "needs_correction", "rejected"];
// const STATUS_STYLES = {
//   verified: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
//   pending: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
//   needs_correction: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
//   not_verified: "bg-red-500/10 text-red-400 border border-red-500/20",
//   rejected: "bg-red-500/10 text-red-500 border border-red-500/20",
// };
// const STATUS_LABELS = {
//   verified: "Verified",
//   pending: "Pending",
//   needs_correction: "Needs Correction",
//   not_verified: "Not Verified",
//   rejected: "Rejected",
// };

// // ── Toast Keyframes ──
// const toastKeyframes = `
// @keyframes toastSlideIn {
//   from { opacity: 0; transform: translate(-50%, 20px); }
//   to   { opacity: 1; transform: translate(-50%, 0); }
// }
// @keyframes modalZoomIn {
//   from { opacity: 0; transform: scale(0.92); }
//   to   { opacity: 1; transform: scale(1); }
// }
// `;

// // ── Toast Component ──
// function Toast({ message, type, onClose }) {
//   useEffect(() => {
//     const timer = setTimeout(onClose, 3000);
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   return (
//     <>
//       <style>{toastKeyframes}</style>
//       <div
//         className="fixed bottom-6 left-1/2 z-[200]"
//         style={{ animation: 'toastSlideIn 0.35s ease-out forwards' }}
//       >
//         <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border ${type === 'error'
//             ? 'bg-red-500/90 border-red-500/20 text-white'
//             : 'bg-[#1a1a1a]/95 border-[#CCFF00]/30 text-[#CCFF00]'
//           }`}>
//           {type === 'error'
//             ? <Icons.XCircleIcon size={18} color="#fff" />
//             : <Icons.CheckCircleIcon size={18} color="#CCFF00" />
//           }
//           <div className="font-bold font-['Space_Grotesk'] text-sm">{message}</div>
//           <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
//             <Icons.XIcon size={16} />
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }

// // ── View User Detail Modal ──
// function ViewUserDetailModal({ user, onClose, onAccept, onReject, onRequestEdit }) {
//   const [lightbox, setLightbox] = useState(null);

//   if (!user) return null;
//   const photos = user.uploads || {};
//   const photoList = [
//     { key: "idFront", label: "ID Front", icon: <Icons.IdCardIcon size={16} /> },
//     { key: "idBack", label: "ID Back", icon: <Icons.IdCardIcon size={16} /> },
//     { key: "faceScan", label: "Face Scan", icon: <Icons.UserIcon size={16} /> },
//     { key: "selfie", label: "Selfie", icon: <Icons.SmartphoneIcon size={16} /> },
//   ];

//   const regDate = user.registeredAt ? new Date(user.registeredAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown';

//   return (
//     <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm p-4 overflow-y-auto">
//       <div
//         className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-3xl shadow-2xl my-auto"
//         style={{ animation: 'modalZoomIn 0.2s ease-out' }}
//       >
//         <style>{toastKeyframes}</style>
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
//           <div className="flex items-center gap-4">
//             <div className="w-14 h-14 bg-[#CCFF00]/10 rounded-2xl flex items-center justify-center text-[#CCFF00] text-xl font-bold">
//               {(user.name || user.first || "?").charAt(0).toUpperCase()}
//             </div>
//             <div>
//               <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">{user.name || `${user.first} ${user.last}`}</h2>
//               <div className="flex flex-col gap-2 text-sm text-gray-400 mt-3 font-mono">
//                 <div className="flex items-center gap-2"><Icons.SmartphoneIcon size={14} /> {user.phone || 'No phone provided'}</div>
//                 <div className="flex items-center gap-2"><Icons.IdCardIcon size={14} /> NID: <span className="text-[#CCFF00] font-bold tracking-widest">{user.nid || 'Not Provided'}</span></div>
//                 <div className="flex items-center gap-2"><Icons.ClockIcon size={14} /> Reg: {regDate}</div>
//               </div>
//             </div>
//           </div>
//           <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors absolute top-6 right-6 md:relative md:top-0 md:right-0">
//             <Icons.XIcon size={20} />
//           </button>
//         </div>

//         <div className="mb-4 text-sm font-bold text-gray-500 uppercase tracking-widest">Verification Documents</div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
//           {photoList.map(({ key, label, icon }) => (
//             <div key={key} className="bg-white/5 border border-white/5 rounded-xl overflow-hidden shadow-inner">
//               <div className="text-gray-400 text-xs uppercase tracking-wider font-bold px-4 pt-3 pb-2 flex items-center gap-2 border-b border-white/5">
//                 {icon} {label}
//               </div>
//               {photos[key] ? (
//                 <div className="relative group cursor-pointer h-48 bg-black/50" onClick={() => setLightbox(photos[key])}>
//                   {user.updatedFields && user.updatedFields[key] && (
//                     <div className="absolute top-2 right-2 bg-[#CCFF00] text-[#111] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider z-10 shadow-lg">Updated</div>
//                   )}
//                   <img
//                     src={photos[key]}
//                     alt={label}
//                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                   />
//                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#CCFF00] font-bold text-sm z-20">
//                     <Icons.CameraIcon size={20} color="#CCFF00" className="mr-2" /> View Full ID
//                   </div>
//                 </div>
//               ) : (
//                 <div className="w-full h-48 flex flex-col items-center justify-center text-gray-600 gap-2 bg-black/20">
//                   <Icons.AlertTriangleIcon size={24} color="#555" />
//                   <span className="text-xs font-bold uppercase tracking-widest">Missing</span>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         {user.correctionHistory && user.correctionHistory.length > 0 && (
//           <div className="mb-8">
//             <div className="mb-4 text-sm font-bold text-gray-500 uppercase tracking-widest">Correction History</div>
//             <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden p-4 space-y-3 max-h-40 overflow-y-auto">
//               {user.correctionHistory.map((log, idx) => (
//                 <div key={idx} className="flex gap-3 text-sm">
//                   <div className="text-[#CCFF00] font-mono shrink-0 w-32">
//                     {new Date(log.date).toLocaleString("en-GB", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}:
//                   </div>
//                   <div className="text-gray-300">
//                     {log.status && <span className="text-orange-400 font-bold text-[10px] uppercase mr-2 tracking-wider">[{log.status}]</span>}
//                     {log.message || log.msg}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         <div className="flex flex-col sm:flex-row gap-3">
//           {user.status !== "verified" && (
//             <button
//               onClick={() => { onAccept(user); onClose(); }}
//               className="flex-1 py-3.5 rounded-xl bg-[#CCFF00] text-[#111] font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
//             >
//               <Icons.CheckCircleIcon size={18} color="#111" /> Verify User
//             </button>
//           )}
//           {user.status !== "verified" && (
//             <button
//               onClick={() => { onRequestEdit(user); onClose(); }}
//               className="flex-1 py-3.5 rounded-xl bg-orange-500/10 text-orange-400 font-bold hover:bg-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-orange-500/20"
//             >
//               <Icons.AlertTriangleIcon size={18} color="currentColor" /> Request Correction
//             </button>
//           )}
//           <button
//             onClick={() => { onReject(user); onClose(); }}
//             className={`${user.status === "verified" ? "flex-1" : "px-6"} py-3.5 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-red-500/20`}
//           >
//             <Icons.XCircleIcon size={18} color="currentColor" /> {user.status === 'verified' ? 'Revoke & Delete' : 'Reject'}
//           </button>
//         </div>
//       </div>

//       {lightbox && (
//         <div className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center backdrop-blur-md" onClick={() => setLightbox(null)}>
//           <button className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" onClick={() => setLightbox(null)}>
//             <Icons.XIcon size={32} />
//           </button>
//           <img src={lightbox} className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Confirm Action Modal ──
// function ConfirmActionModal({ title, message, confirmLabel, confirmColor, onClose, onConfirm, icon }) {
//   return (
//     <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm">
//       <div
//         className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
//         style={{ animation: 'modalZoomIn 0.2s ease-out' }}
//       >
//         <style>{toastKeyframes}</style>
//         <div className="flex flex-col items-center text-center gap-4">
//           <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${confirmColor === 'red' ? 'bg-red-500/10' : confirmColor === 'yellow' ? 'bg-yellow-500/10' : 'bg-emerald-500/10'
//             }`}>
//             {icon}
//           </div>
//           <div>
//             <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] mb-1">{title}</h3>
//             <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
//           </div>
//           <div className="flex gap-3 w-full pt-2">
//             <button
//               onClick={onClose}
//               className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm font-bold hover:text-white hover:border-white/20 transition-all bg-transparent"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={() => { onConfirm(); onClose(); }}
//               className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${confirmColor === 'red'
//                   ? 'bg-red-500 hover:bg-red-600 text-white'
//                   : confirmColor === 'yellow'
//                     ? 'bg-yellow-500 hover:bg-yellow-600 text-[#111]'
//                     : 'bg-emerald-500 hover:bg-emerald-600 text-white'
//                 }`}
//             >
//               {confirmLabel}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function UsersPage({ state, setState }) {
//   const { search } = useContext(SearchContext);
//   const [activeTab, setActiveTab] = useState("All");
//   const [viewingUserDetail, setViewingUserDetail] = useState(null);
//   const [confirmAction, setConfirmAction] = useState(null);
//   const [toast, setToast] = useState(null);
//   const [requestEditUser, setRequestEditUser] = useState(null);
//   const [editReason, setEditReason] = useState("");

//   const showToast = (message, type = 'success') => setToast({ message, type });

//   // Data is now provided via props 'state.users' from AppRoot's real-time listener.
//   // We no longer need the local fetchUsers effect.
//   const users = state.users || [];

//   // Pillar 4: Handle Bell Filter from Header
//   useEffect(() => {
//     const filter = sessionStorage.getItem('admin_user_filter');
//     if (filter === 'pending') {
//       setActiveTab('pending');
//       sessionStorage.removeItem('admin_user_filter');
//     }
//   }, []);

//   // Filter logic safely against Array
//   const safeUsers = Array.isArray(users) ? users : [];
//   const filtered = safeUsers.filter(u => {
//     const matchSearch =
//       (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
//       (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
//       (u.first || "").toLowerCase().includes(search.toLowerCase()) ||
//       (u.last || "").toLowerCase().includes(search.toLowerCase());
//     const userStatus = (u.status || "").toLowerCase();
//     const matchTab = activeTab === "All" || userStatus === activeTab.toLowerCase();
//     return matchSearch && matchTab;
//   });

//   // Tab counts
//   const counts = {
//     All: safeUsers.length,
//     pending: safeUsers.filter(u => (u.status || "").toLowerCase() === "pending").length,
//     verified: safeUsers.filter(u => (u.status || "").toLowerCase() === "verified").length,
//     needs_correction: safeUsers.filter(u => (u.status || "").toLowerCase() === "needs_correction").length,
//     rejected: safeUsers.filter(u => (u.status || "").toLowerCase() === "rejected").length,
//   };

//   // ── Actions ──
//   function handleAccept(user) {
//     setConfirmAction({
//       title: "Accept User",
//       message: <>Verify <span className="text-white font-bold">{user.name || `${user.first} ${user.last}`}</span>? They will be marked as Verified.</>,
//       confirmLabel: "Accept",
//       confirmColor: "green",
//       icon: <Icons.CheckCircleIcon size={24} color="#4CAF50" />,
//       onConfirm: async () => {
//         try {
//           const userRef = doc(db, "users", user.uid);
//           const updates = {
//             status: "verified",
//             verifiedAt: new Date().toISOString(),
//             alerts: [{ 
//               id: Date.now(), 
//               title: "Account Verified!", 
//               message: "Congratulations! You have been approved by Admin and can now rent bikes.", 
//               type: "success", 
//               date: new Date().toISOString(), 
//               read: false 
//             }, ...(user.alerts || [])]
//           };

//           await updateDoc(userRef, updates);

//           if (setState) {
//             setState(prev => {
//               if (prev.user && (prev.user.phone === user.phone || prev.user.email === user.email)) {
//                 const updatedUser = { ...prev.user, ...user, status: 'verified' };
//                 localStorage.setItem('bike_app_user', JSON.stringify(updatedUser));
//                 return { ...prev, user: updatedUser };
//               }
//               return prev;
//             });
//           }

//           await logAdminAction("Verify User", `Verified ${user.name || user.first} (${user.phone || user.email})`);
//           showToast("User Verified! They can now access the full application.");
//         } catch (err) {
//           console.error("Verification failed:", err);
//           showToast("Failed to verify user", "error");
//         }
//       }
//     });
//   }

//   function handleReject(user) {
//     setConfirmAction({
//       title: "Reject Request",
//       message: <>Reject <span className="text-white font-bold">{user.name || `${user.first} ${user.last}`}</span>? This will mark them as Rejected.</>,
//       confirmLabel: "Reject",
//       confirmColor: "red",
//       icon: <Icons.XCircleIcon size={24} color="#F44336" />,
//       onConfirm: async () => {
//         try {
//           const userRef = doc(db, "users", user.uid);
//           await updateDoc(userRef, {
//             status: "rejected",
//             alerts: [{ 
//               id: Date.now(), 
//               title: "Application Rejected", 
//               message: "Your verification request was rejected. Please contact support.", 
//               type: "error", 
//               date: new Date().toISOString(), 
//               read: false 
//             }, ...(user.alerts || [])]
//           });

//           await logAdminAction("Reject User", `Rejected ${user.name || user.first} (${user.phone || user.email})`);
//           showToast(`${user.name || user.first}'s request rejected`, 'error');
//         } catch (err) {
//           showToast("Failed to reject user", "error");
//         }
//       }
//     });
//   }

//   function handleRequestEdit(user) {
//     setRequestEditUser(user);
//     setEditReason("");
//   }

//   return (
//     <div className="space-y-6">
//       {/* Toast */}
//       {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

//       {/* Request Edit Modal */}
//       {requestEditUser && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm">
//           <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl" style={{ animation: 'modalZoomIn 0.2s ease-out' }}>
//             <div className="flex flex-col gap-4">
//               <div className="w-14 h-14 rounded-full flex items-center justify-center bg-yellow-500/10 self-center">
//                 <Icons.AlertTriangleIcon size={28} color="#eab308" />
//               </div>
//               <div className="text-center">
//                 <h3 className="text-lg font-bold text-white mb-1 tracking-wide">Request Correction</h3>
//                 <p className="text-gray-400 text-sm">Ask <span className="text-white font-bold">{requestEditUser.name || requestEditUser.first}</span> to re-upload photos.</p>
//               </div>
//               <div className="mt-2">
//                 <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2 block">Reason for Correction (Optional)</label>
//                 <textarea
//                   className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:border-[#CCFF00]/50 focus:outline-none resize-none transition-colors"
//                   rows="3"
//                   placeholder="e.g., ID Front is blurry, please retake in good lighting."
//                   value={editReason}
//                   onChange={(e) => setEditReason(e.target.value)}
//                 />
//               </div>
//               <div className="flex gap-3 pt-2">
//                 <button onClick={() => setRequestEditUser(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm font-bold hover:text-white bg-transparent transition-colors">Cancel</button>
//                 <button
//                   onClick={async () => {
//                     try {
//                       const logEntry = {
//                         date: new Date().toISOString(),
//                         message: editReason || "Photo correction requested",
//                         status: "needs_correction"
//                       };

//                       const userRef = doc(db, "users", requestEditUser.uid);
//                       await updateDoc(userRef, {
//                         status: "needs_correction",
//                         correctionHistory: [logEntry, ...(requestEditUser.correctionHistory || [])],
//                         alerts: [{
//                           id: Date.now(),
//                           title: "Correction Required",
//                           message: editReason || "Admin requested corrections to your documents.",
//                           type: "warning",
//                           date: new Date().toISOString(),
//                           read: false
//                         }, ...(requestEditUser.alerts || [])]
//                       });

//                       await logAdminAction("Request Correction", `Requested fix from ${requestEditUser.name || requestEditUser.first} for: ${editReason || 'No reason specified'}`);
//                       showToast("Correction request sent.");
//                       setRequestEditUser(null);
//                     } catch (err) {
//                       showToast("Failed to send request", "error");
//                     }
//                   }}
//                   className="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-[#111] text-sm font-bold transition-colors"
//                 >
//                   Send Request
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modals */}
//       {viewingUserDetail && (
//         <ViewUserDetailModal
//           user={viewingUserDetail}
//           onClose={() => setViewingUserDetail(null)}
//           onAccept={handleAccept}
//           onReject={handleReject}
//           onRequestEdit={handleRequestEdit}
//         />
//       )}
//       {confirmAction && (
//         <ConfirmActionModal
//           title={confirmAction.title}
//           message={confirmAction.message}
//           confirmLabel={confirmAction.confirmLabel}
//           confirmColor={confirmAction.confirmColor}
//           icon={confirmAction.icon}
//           onClose={() => setConfirmAction(null)}
//           onConfirm={confirmAction.onConfirm}
//         />
//       )}

//       {/* Header */}
//       <div>
//         <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">User Verifications</h1>
//         <p className="text-gray-500 text-sm mt-1">
//           {counts.pending} pending · {counts.verified} verified · {users.length} total
//         </p>
//       </div>

//       {/* Status Tabs */}
//       <div className="flex items-center gap-2">
//         {STATUS_TABS.map(tab => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab
//                 ? "bg-[#CCFF00] text-[#111]"
//                 : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
//               }`}
//           >
//             {tab === "All" ? "All" : STATUS_LABELS[tab] || tab}
//             <span className={`ml-2 text-xs ${activeTab === tab ? "text-[#111]/60" : "text-gray-600"}`}>
//               {counts[tab] || 0}
//             </span>
//           </button>
//         ))}
//       </div>

//       {/* Table */}
//       <div className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden">
//         <div className="overflow-x-auto no-scrollbar">
//           <table className="w-full text-sm text-left">
//             <thead>
//               <tr className="border-b border-white/5 bg-white/5">
//                 <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">User</th>
//                 <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Email</th>
//                 <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Phone</th>
//                 <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Photos</th>
//                 <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Status</th>
//                 <th className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px] text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-white/5">
//               {filtered && filtered.length > 0 ? filtered.map(user => (
//                 <tr
//                   key={user.id}
//                   onClick={() => setViewingUserDetail(user)}
//                   className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
//                 >
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-lg bg-[#CCFF00]/10 flex items-center justify-center text-[#CCFF00] font-bold text-xs shrink-0">
//                         {(user.name || user.first || "?").charAt(0).toUpperCase()}
//                       </div>
//                       <span className="text-white font-medium">{user.name || `${user.first || ""} ${user.last || ""}`.trim() || "Unknown"}</span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 text-gray-400 text-xs">{user.email || "—"}</td>
//                   <td className="px-6 py-4 text-gray-400 font-mono text-xs">{user.phone || "—"}</td>
//                   <td className="px-6 py-4">
//                     {user.uploads && Object.keys(user.uploads).length > 0 ? (
//                       <span className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
//                         <Icons.CameraIcon size={14} color="#888" />
//                         {Object.values(user.uploads).filter(Boolean).length}/4
//                       </span>
//                     ) : (
//                       <span className="text-gray-600 text-xs italic">Missing</span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[user.status] || STATUS_STYLES.pending}`}>
//                       {STATUS_LABELS[user.status] || user.status || "Unknown"}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 text-right">
//                     <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
//                       <span className="text-xs text-[#CCFF00] font-bold group-hover:underline flex items-center gap-1">
//                         View Details <Icons.ChevronRightIcon size={12} color="#CCFF00" />
//                       </span>
//                     </div>
//                   </td>
//                 </tr>
//               )) : (
//                 <tr>
//                   <td colSpan={6} className="px-6 py-20 text-center">
//                     <div className="flex flex-col items-center gap-3 opacity-30">
//                       <Icons.ShieldCheckIcon size={48} color="#888" />
//                       <p className="text-white text-lg font-medium">
//                         {activeTab === "All" ? "No pending verification requests" : `No ${STATUS_LABELS[activeTab] || activeTab} requests`}
//                       </p>
//                       <p className="text-gray-500 text-sm">Users who register through the app will appear here for review</p>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState, useContext, useEffect } from "react";
import { SearchContext } from "../components/AdminLayout.jsx";
import * as Icons from "../../assets/Icons.jsx";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { logAdminAction } from '../utils/logger.js';

// ── Status Config ──
const STATUS_TABS = ["All", "pending", "verified", "needs_correction", "rejected"];
const STATUS_STYLES = {
  verified: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  pending: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  needs_correction: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  not_verified: "bg-red-500/10 text-red-400 border border-red-500/20",
  rejected: "bg-red-500/10 text-red-500 border border-red-500/20",
};
const STATUS_LABELS = {
  verified: "Verified",
  pending: "Pending",
  needs_correction: "Needs Correction",
  not_verified: "Not Verified",
  rejected: "Rejected",
};

// ── Toast Keyframes ──
const toastKeyframes = `
@keyframes toastSlideIn {
  from { opacity: 0; transform: translate(-50%, 20px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}
@keyframes modalZoomIn {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}
`;

// ── Toast Component ──
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      <style>{toastKeyframes}</style>
      <div
        className="fixed bottom-6 left-1/2 z-[200]"
        style={{ animation: 'toastSlideIn 0.35s ease-out forwards' }}
      >
        <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border ${type === 'error'
          ? 'bg-red-500/90 border-red-500/20 text-white'
          : 'bg-[#1a1a1a]/95 border-[#CCFF00]/30 text-[#CCFF00]'
          }`}>
          {type === 'error'
            ? <Icons.XCircleIcon size={18} color="#fff" />
            : <Icons.CheckCircleIcon size={18} color="#CCFF00" />
          }
          <div className="font-bold font-['Space_Grotesk'] text-sm">{message}</div>
          <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
            <Icons.XIcon size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

// ── View User Detail Modal ──
function ViewUserDetailModal({ user, onClose, onAccept, onReject, onRequestEdit }) {
  const [lightbox, setLightbox] = useState(null);

  if (!user) return null;
  const photos = user.uploads || {};
  const photoList = [
    { key: "idFront", label: "ID Front", icon: <Icons.IdCardIcon size={16} /> },
    { key: "idBack", label: "ID Back", icon: <Icons.IdCardIcon size={16} /> },
    { key: "faceScan", label: "Face Scan", icon: <Icons.UserIcon size={16} /> },
    { key: "selfie", label: "Selfie", icon: <Icons.SmartphoneIcon size={16} /> },
  ];

  const regDate = user.registeredAt ? new Date(user.registeredAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-3xl shadow-2xl my-auto"
        style={{ animation: 'modalZoomIn 0.2s ease-out' }}
      >
        <style>{toastKeyframes}</style>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#CCFF00]/10 rounded-2xl flex items-center justify-center text-[#CCFF00] text-xl font-bold">
              {(user.name || user.first || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">{user.name || `${user.first} ${user.last}`}</h2>
              <div className="flex flex-col gap-2 text-sm text-gray-400 mt-3 font-mono">
                <div className="flex items-center gap-2"><Icons.SmartphoneIcon size={14} /> {user.phone || 'No phone provided'}</div>
                <div className="flex items-center gap-2"><Icons.IdCardIcon size={14} /> NID: <span className="text-[#CCFF00] font-bold tracking-widest">{user.nid || 'Not Provided'}</span></div>
                <div className="flex items-center gap-2"><Icons.ClockIcon size={14} /> Reg: {regDate}</div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors absolute top-6 right-6 md:relative md:top-0 md:right-0">
            <Icons.XIcon size={20} />
          </button>
        </div>

        {/* AI Result Section */}
        {user.verificationResult && (
          <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">AI Inspection Result</div>
            <div className={`font-bold ${user.verificationResult.match ? 'text-emerald-400' : 'text-red-400'}`}>
              {user.verificationResult.match ? "✓ Match Verified" : `✕ Mismatch: ${user.verificationResult.reason}`}
            </div>
          </div>
        )}

        <div className="mb-4 text-sm font-bold text-gray-500 uppercase tracking-widest">Verification Documents</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {photoList.map(({ key, label, icon }) => (
            <div key={key} className="bg-white/5 border border-white/5 rounded-xl overflow-hidden shadow-inner">
              <div className="text-gray-400 text-xs uppercase tracking-wider font-bold px-4 pt-3 pb-2 flex items-center gap-2 border-b border-white/5">
                {icon} {label}
              </div>
              {photos[key] ? (
                <div className="relative group cursor-pointer h-48 bg-black/50" onClick={() => setLightbox(photos[key])}>
                  <img
                    src={photos[key]}
                    alt={label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#CCFF00] font-bold text-sm z-20">
                    <Icons.CameraIcon size={20} color="#CCFF00" className="mr-2" /> View Full ID
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 flex flex-col items-center justify-center text-gray-600 gap-2 bg-black/20">
                  <Icons.AlertTriangleIcon size={24} color="#555" />
                  <span className="text-xs font-bold uppercase tracking-widest">Missing</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {user.status !== "verified" && (
            <button
              onClick={() => { onAccept(user); onClose(); }}
              className="flex-1 py-3.5 rounded-xl bg-[#CCFF00] text-[#111] font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Icons.CheckCircleIcon size={18} color="#111" /> Verify User
            </button>
          )}
          {user.status !== "verified" && (
            <button
              onClick={() => { onRequestEdit(user); onClose(); }}
              className="flex-1 py-3.5 rounded-xl bg-orange-500/10 text-orange-400 font-bold hover:bg-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-orange-500/20"
            >
              <Icons.AlertTriangleIcon size={18} color="currentColor" /> Request Correction
            </button>
          )}
          <button
            onClick={() => { onReject(user); onClose(); }}
            className={`${user.status === "verified" ? "flex-1" : "px-6"} py-3.5 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-red-500/20`}
          >
            <Icons.XCircleIcon size={18} color="currentColor" /> {user.status === 'verified' ? 'Revoke' : 'Reject'}
          </button>
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center backdrop-blur-md" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" onClick={() => setLightbox(null)}>
            <Icons.XIcon size={32} />
          </button>
          <img src={lightbox} className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

// ── Confirm Action Modal ──
function ConfirmActionModal({ title, message, confirmLabel, confirmColor, onClose, onConfirm, icon }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div
        className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        style={{ animation: 'modalZoomIn 0.2s ease-out' }}
      >
        <style>{toastKeyframes}</style>
        <div className="flex flex-col items-center text-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${confirmColor === 'red' ? 'bg-red-500/10' : confirmColor === 'yellow' ? 'bg-yellow-500/10' : 'bg-emerald-500/10'
            }`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] mb-1">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
          </div>
          <div className="flex gap-3 w-full pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm font-bold hover:text-white hover:border-white/20 transition-all bg-transparent"
            >
              Cancel
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${confirmColor === 'red'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : confirmColor === 'yellow'
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-[#111]'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage({ state, setState }) {
  const { search } = useContext(SearchContext);
  const [activeTab, setActiveTab] = useState("All");
  const [viewingUserDetail, setViewingUserDetail] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toast, setToast] = useState(null);
  const [requestEditUser, setRequestEditUser] = useState(null);
  const [editReason, setEditReason] = useState("");

  const showToast = (message, type = 'success') => setToast({ message, type });
  const users = state.users || [];

  const safeUsers = Array.isArray(users) ? users : [];
  const filtered = safeUsers.filter(u => {
    const matchSearch =
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.first || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.last || "").toLowerCase().includes(search.toLowerCase());
    const userStatus = (u.status || "").toLowerCase();
    const matchTab = activeTab === "All" || userStatus === activeTab.toLowerCase();
    return matchSearch && matchTab;
  });

  const counts = {
    All: safeUsers.length,
    pending: safeUsers.filter(u => (u.status || "").toLowerCase() === "pending").length,
    verified: safeUsers.filter(u => (u.status || "").toLowerCase() === "verified").length,
    needs_correction: safeUsers.filter(u => (u.status || "").toLowerCase() === "needs_correction").length,
    rejected: safeUsers.filter(u => (u.status || "").toLowerCase() === "rejected").length,
  };

  async function handleAccept(user) {
    setConfirmAction({
      title: "Accept User",
      message: <>Verify <span className="text-white font-bold">{user.name || `${user.first} ${user.last}`}</span>?</>,
      confirmLabel: "Accept",
      confirmColor: "green",
      icon: <Icons.CheckCircleIcon size={24} color="#4CAF50" />,
      onConfirm: async () => {
        try {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { status: "verified" });
          await logAdminAction("Verify User", `Verified ${user.name}`);
          showToast("User Verified!");
        } catch (err) {
          showToast("Error", "error");
        }
      }
    });
  }

  async function handleReject(user) {
    setConfirmAction({
      title: "Reject Request",
      message: <>Reject <span className="text-white font-bold">{user.name}</span>?</>,
      confirmLabel: "Reject",
      confirmColor: "red",
      icon: <Icons.XCircleIcon size={24} color="#F44336" />,
      onConfirm: async () => {
        try {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { status: "rejected" });
          showToast("User rejected", "error");
        } catch (err) {
          showToast("Error", "error");
        }
      }
    });
  }

  function handleRequestEdit(user) {
    setRequestEditUser(user);
    setEditReason("");
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Request Edit Modal */}
      {requestEditUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Request Correction</h3>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
              rows="3"
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setRequestEditUser(null)} className="flex-1 py-2 rounded-xl border border-white/10">Cancel</button>
              <button
                onClick={async () => {
                  const userRef = doc(db, "users", requestEditUser.uid);
                  await updateDoc(userRef, { status: "needs_correction" });
                  setRequestEditUser(null);
                  showToast("Correction requested");
                }}
                className="flex-1 py-2 rounded-xl bg-[#CCFF00] text-black font-bold"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingUserDetail && (
        <ViewUserDetailModal
          user={viewingUserDetail}
          onClose={() => setViewingUserDetail(null)}
          onAccept={handleAccept}
          onReject={handleReject}
          onRequestEdit={handleRequestEdit}
        />
      )}

      {confirmAction && (
        <ConfirmActionModal
          {...confirmAction}
          onClose={() => setConfirmAction(null)}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-white">User Verifications</h1>
      </div>

      <div className="flex items-center gap-2">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-sm font-bold ${activeTab === tab ? "bg-[#CCFF00] text-[#111]" : "bg-white/5 text-gray-400"}`}>
            {STATUS_LABELS[tab] || tab} ({counts[tab] || 0})
          </button>
        ))}
      </div>

      <div className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 text-gray-500 uppercase text-[10px]">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(user => (
              <tr key={user.id} onClick={() => setViewingUserDetail(user)} className="hover:bg-white/[0.04] cursor-pointer">
                <td className="px-6 py-4 text-white">{user.name || "Unknown"}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${STATUS_STYLES[user.status]}`}>
                    {STATUS_LABELS[user.status] || user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-[#CCFF00] font-bold text-xs">View Details</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}