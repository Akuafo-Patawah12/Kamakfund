import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import AdvancedSidebarNav from '../Components/Sidebar';
import Profile from '../Pages/Management/Profile';
import Header from '../Components/Header';
import Dashboard from '../Pages/Dashoard';
import Account from '../Pages/Financial/Account';
import FixedIncome from '../Pages/Investment/fixedIncome';
import BondInvestments from '../Pages/Investment/bond';
import NonFixedInvestments from '../Pages/Investment/nonFixedInvestment';
import CollectiveInvestments from '../Pages/Financial/collectiveInvestment';
import RealEstateInvestments from '../Pages/Other Investments/realEstate';
import DebtInvestments from '../Pages/Other Investments/debtInvestment';
import PrivateEquityInvestments from '../Pages/Other Investments/privateEquity';
import CommercialPaperInvestments from '../Pages/Other Investments/commercialPaper';
import ConsolidatedView from '../Pages/Management/consolidatedView';

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
    <div className="flex w-full ">
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
          <Route path="/collective_investment" element={<CollectiveInvestments />} />

          {/* Investment Route*/}
          <Route path="/investment/fixedIncome" element={<FixedIncome />} />
          <Route path="/investment/nonFixedIncome" element={<NonFixedInvestments/>} />
          <Route path="/investment/bonds" element={<BondInvestments/>} />

          {/* Other Investments Route */}
          <Route path='/other+investment/realEstateInvestment' element={<RealEstateInvestments/>} />
          <Route path="/other+investment/debtInvestment"  element={<DebtInvestments/>}  />
          <Route path="/other+investment/private-equity-investment" element={<PrivateEquityInvestments/>} />
          <Route path="/other+investment/commercial-paper-investment" element={<CommercialPaperInvestments/>} />


          {/* Management Route */}
          <Route path="/management/consolidated-view" element={<ConsolidatedView />} />

        </Routes>
      </main>
    </div>
  );
};

export default Layout;