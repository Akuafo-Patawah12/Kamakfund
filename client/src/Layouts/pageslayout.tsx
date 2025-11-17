import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import AdvancedSidebarNav from '../Components/Sidebar';
import Profile from '../Pages/Profile';
import Header from '../Components/Header';
import Dashboard from '../Pages/Dashoard';
import Account from '../Pages/Financial/Account';
import FixedIncome from '../Pages/Investment/fixedIncome';
import BondInvestments from '../Pages/Investment/bond';
import NonFixedInvestments from '../Pages/Investment/nonFixedInvestment';

const Layout: React.FC = () => {
  const location = useLocation();
  const pageName = location.state?.pageName || "Dashboard";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex w-full bg-yellow-200">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Hidden on mobile by default, slides in when open */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <AdvancedSidebarNav onNavigate={closeSidebar} />
      </div>

      {/* Main Content */}
      <main className="h-screen overflow-auto w-full">
        <Header 
          title={pageName} 
          onMenuClick={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <Routes>
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/profile" element={<Profile />} />

          {/* Financial Routes */}
          <Route path="/account" element={<Account />} />

          {/* Investment Route*/}
          <Route path="/investment/fixedIncome" element={<FixedIncome />} />
          <Route path="/investment/nonFixedIncome" element={<NonFixedInvestments/>} />
          <Route path="/investment/bonds" element={<BondInvestments/>} />

        </Routes>
      </main>
    </div>
  );
};

export default Layout;