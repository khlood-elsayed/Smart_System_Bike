import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

export const SearchContext = React.createContext({ search: "", setSearch: () => {} });

export default function AdminLayout({ children, navigate, state, setState }) {
  const [search, setSearch] = useState("");
  const user = state?.user || { name: "Admin" };

  useEffect(() => {
    document.body.classList.add('admin-body');
    return () => document.body.classList.remove('admin-body');
  }, []);

  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      <div className="flex w-full h-screen bg-[#0d0d0d] overflow-hidden font-['DM_Sans',_sans-serif] no-scrollbar">
        <Sidebar navigate={navigate} setState={setState} />
        <div className="flex flex-col flex-1 min-w-0">
          <Header search={search} setSearch={setSearch} user={user} setScreen={navigate} setState={setState} />
          <main className="flex-1 overflow-y-auto p-6 no-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </SearchContext.Provider>
  );
}
