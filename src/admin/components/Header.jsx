import React, { useState, useEffect } from "react";
import { Bell, Search, ChevronDown, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import localforage from 'localforage';

export default function Header({ search, setSearch, user, setScreen, setState }) {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Calculate pending users dynamically
  useEffect(() => {
    const updateCount = async () => {
      try {
        const appUsers = await localforage.getItem('app_users') || [];
        const count = appUsers.filter(u => u.status === 'pending').length;
        setPendingCount(count);
      } catch(e) {}
    };
    
    updateCount();
    // Re-check periodically or listen to storage changes
    const interval = setInterval(updateCount, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#111] border-b border-white/5 flex items-center justify-between px-6 shrink-0">
      {/* Search */}
      <div className="relative w-80">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search bikes, users, trips..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#CCFF00]/50 transition-colors"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button 
          onClick={() => {
            // Keep admin in admin context
            navigate('/admin/users');
            sessionStorage.setItem('admin_user_filter', 'pending');
          }}
          className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          title={`${pendingCount} pending users`}
        >
          <Bell size={16} className={pendingCount > 0 ? "text-[#CCFF00]" : "text-gray-400"} />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#CCFF00] text-[#111] text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#111]">
              {pendingCount}
            </span>
          )}
        </button>

        {/* Admin Profile - Mode Switcher */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            title="Profile Menu"
          >
            <div className="w-7 h-7 rounded-lg bg-[#CCFF00] flex items-center justify-center text-[#111]">
              <ShieldCheck size={14} />
            </div>
            <span className="text-sm text-white font-medium">Admin</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          
          {showProfileMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
              <button 
                onClick={() => { setShowProfileMenu(false); }} 
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                Admin Settings
              </button>
              <button 
                onClick={() => {
                  setShowProfileMenu(false);
                  if (setState) {
                     setState(s => ({ ...s, isAdminMode: false, user: { ...s.user, status: 'verified' } }));
                     localforage.getItem('app_users').then(users => {
                         if (users && user?.phone) {
                             const updated = users.map(u => u.phone === user.phone ? { ...u, status: 'verified' } : u);
                             localforage.setItem('app_users', updated);
                         }
                     });
                  }
                  if (setScreen) setScreen('map');
                  navigate('/');
                }} 
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                Exit to App
              </button>
              <button 
                onClick={() => {
                  setShowProfileMenu(false);
                  localStorage.removeItem('bike_app_user');
                  localStorage.removeItem('admin_mode');
                  if (setState) {
                    setState(s => ({
                      ...s,
                      isAdminMode: false,
                      user: { name: "", email: "", profilePic: "", role: "", phone: "", first: "", last: "", status: null }
                    }));
                  }
                  if (setScreen) setScreen('welcome');
                  navigate('/');
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5 mt-1 pt-2"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
