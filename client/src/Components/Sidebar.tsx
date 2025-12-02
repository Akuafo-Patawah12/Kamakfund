import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  User,
  Wallet,
  BarChart3,
  LineChart,
  DollarSign,
  Landmark,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  type LucideProps,
  Scroll,
  FileText,
  Building2,
  ReceiptText,
  Briefcase,
  LayoutDashboard,
  Calculator,
  HelpCircle,
  ChevronRight,
  Search,
  MessageCircle,
  Lock,
} from "lucide-react";

import { Link } from 'react-router-dom';
import { handleLogout } from '../utils/logoutFunction';


interface AdvancedSidebarNavProps {
  onNavigate?: () => void;
}

interface MenuItem {
  name: string;
  icon: React.ComponentType;
  badge?: string;
  path?: string;
}

interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}


export default function AdvancedSidebarNav({ onNavigate }: AdvancedSidebarNavProps) {
  const [activeItem, setActiveItem] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['financial', 'tools']);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("fullName");
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const menuSections: MenuSection[] = [
    {
    id: "Consolidated",
    title: "Home",
    items: [
      { name: "Consolidated View", icon: LayoutDashboard, path: "/u/management/consolidated-view" }
    ],
  },
  {
    id: "financial",
    title: "Financial",
    items : [
      { name: "Account", icon: Wallet, badge: "3", path:"/u/account" },
      { name: "Collective Investments", icon: BarChart3, badge: "3" ,path:"/u/collective_investment" },
      { name: "Loans", icon: Landmark, path: "/u/loans" },
    ],
  },

  {
    id: "investment",
    title: "Investment",
    items: [
      { name: "Fixed Income", icon: DollarSign, path: "/u/investment/fixedIncome" },
      { name: "Bonds", icon: Scroll, path: "/u/investment/bonds" },
      { name: "Non Fixed Incomes", icon: LineChart , path: "/u/investment/nonFixedIncome" },
    ],
  },

  {
    id: "other_investment",
    title: "Other Investment",
    items: [
      { name: "Commercial Paper", icon: FileText , path:"/u/other-investment/commercial-paper-investment" },
      { name: "Real Estate Property", icon: Building2, path:"/u/other-investment/realEstateInvestment"},
      { name: "Debt Investment", icon: ReceiptText , path:"/u/other-investment/debtInvestment"},
      { name: "Private Equity Investment", icon: Briefcase , path: "/u/other-investment/private-equity-investment"},
    ],
  },

  {
    id: "management",
    title: "Management",
    items: [
      { name: "Profile", icon: User, path: "/u/profile" },
      
    ],
  },

  {
    id: "tools",
    title: "Tools & Resources",
    items: [
      { name: "Investment Calculator", icon: Calculator ,path:"/u/tools/investment-calculator"},
      { name: "Frequently asked questions", icon: HelpCircle },
    ],
  },

  {
    id: "support",
    title: "Support",
    items: [
      { name: "Chat with us", icon: MessageCircle, badge: "2" },
    ],
  },

  {
    id: "security",
    title: "Security",
    items: [{ name: "Change of password", icon: Lock }],
  },
];


  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

 
 const location = useLocation();

 useEffect(() => {
   const pageName = location.state?.pageName;
    if (pageName) {
      setActiveItem(pageName);
    }
  }, [location.state]);
  const handleItemClick = (itemName: string) => {
    setActiveItem(itemName);
    // Call onNavigate to close sidebar on mobile
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <>
      <div 
        className={`${
          isCollapsed ? 'w-20' : 'w-80'
        }  bg-(--background) text-slate-100 transition-all duration-300 ease-in-out flex flex-col relative border-r border-slate-800 h-screen`}
      >
        {/* Header Section */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center justify-between mb-6">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center font-bold text-lg shadow-lg">
                  KF
                </div>
                <div>
                  <h1 className="text-lg font-bold text-red-400">KAMAKFUND</h1>
                  <p className="text-xs text-slate-400">Fund Management App</p>
                </div>
              </div>
            )}
            {/* Hide collapse button on mobile */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 rounded-lg hover:bg-slate-800 transition-colors ml-auto"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Search Bar */}
          {!isCollapsed && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto custom-scrollbar">
          {menuSections.map((section) => (
            <div key={section.id} className="mb-6">
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-300 transition-colors group"
                >
                  <span>{section.title}</span>
                  <ChevronDown 
                    size={14} 
                    className={`transform transition-transform ${
                      expandedSections.includes(section.id) ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              )}
              
              <div className={`space-y-1 mt-2 ${
                !isCollapsed && !expandedSections.includes(section.id) ? 'hidden' : ''
              }`}>
                {section.items.map((item) => {
                  const Icon = item.icon as React.FC<LucideProps>;
                  const isActive = activeItem === item.name;
                  
                  return (
                    <Link 
                      to={item?.path || "/"} 
                      state={{ pageName: item.name }}  
                      key={item.name}
                      
                    >
                      <button
                        onClick={() => handleItemClick(item.name)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-3 rounded-lg
                          transition-all duration-200 group relative
                          ${isActive 
                            ? 'bg-red-500/10 text-white shadow-lg' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }
                        `}
                      >
                        <Icon size={20} className="shrink-0" />
                        {!isCollapsed && (
                          <span className="text-sm font-medium flex-1 text-left">
                            {item.name}
                          </span>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-xl border border-slate-700">
                            {item.name}
                          </div>
                        )}
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-slate-800">
          {/* Settings & Logout */}
          <div className="p-3 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all group relative">
              <Settings size={20} className="shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
                  Settings
                </div>
              )}
            </button>
            
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group relative">
              <LogOut size={20} className="shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
                  Logout
                </div>
              )}
            </button>
          </div>

          {/* User Profile */}
          {!isCollapsed && (
            <div className="p-4 m-3 bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" 
                    alt="User" 
                    className="w-11 h-11 rounded-full border-2 border-slate-700"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user}</p>
                  
                </div>
                <button className="text-slate-400 hover:text-slate-300">
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </>
  );
}