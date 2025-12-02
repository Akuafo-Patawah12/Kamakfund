import React, { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  TrendingUp, 
  Wallet, 
  PieChart, 
  DollarSign, 
  Activity, 
  RefreshCw, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle
} from "lucide-react";
import InvestmentSummaryDesign from "../../Components/investment_summary_design";

// --- Interfaces ---

interface CommercialPaperInvestment {
  id: number;
  amountInvested: number;
  dailyInterest: number;
  interestRate: number;
  faceValue: number;
  maturityDate: string;
  nextPaymentDate: string;
  principalPayment: number;
  totalInterestAccrued: number;
  totalPayment: number;
  tradeDate: string;
  customerId: number;
  description?: string;
}

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

interface ApiResponse {
  status: number;
  data: CommercialPaperInvestment[];
  pagination: PaginationInfo;
  message?: string;
}

// --- Component ---

function CommercialPaperInvestments() {
  const [investments, setInvestments] = useState<CommercialPaperInvestment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  // Filter states
  const [filterMinInvestment, setFilterMinInvestment] = useState<string>("");
  const [filterMaxInvestment, setFilterMaxInvestment] = useState<string>("");
  const [filterMinInterestRate, setFilterMinInterestRate] = useState<string>("");
  const [filterMaxInterestRate, setFilterMaxInterestRate] = useState<string>("");
  const [filterMinFaceValue, setFilterMinFaceValue] = useState<string>("");
  const [filterMaxFaceValue, setFilterMaxFaceValue] = useState<string>("");
  const [filterMaturityStatus, setFilterMaturityStatus] = useState<string>("all");
  const [filterTradeYear, setFilterTradeYear] = useState<string>("all");
  const [userId, setUserId] = useState<string>("");

  // Summary stats
  const [stats, setStats] = useState({
    totalInvested: 0,
    totalFaceValue: 0,
    totalInterestAccrued: 0,
    avgInterestRate: 0,
    activeCount: 0
  });

  const url = (import.meta as any).env.VITE_BASE_URL || "";

  // User ID Retrieval
  useEffect(() => {
    const storedUser = localStorage.getItem("userId");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserId(parsed || storedUser);
      } catch {
        setUserId(storedUser);
      }
    }
  }, []);

  // Helper Functions
  const calculateDaysToMaturity = (maturityDate: string): number => {
    if (!maturityDate) return 0;
    const today = new Date();
    const maturity = new Date(maturityDate);
    const diffTime = maturity.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getMaturityStatus = (investment: CommercialPaperInvestment): string => {
    const daysToMaturity = calculateDaysToMaturity(investment.maturityDate);
    if (daysToMaturity < 0) return "matured";
    if (daysToMaturity <= 30) return "maturing-soon";
    return "active";
  };

  const calculateYield = (investment: CommercialPaperInvestment): number => {
    if (investment.amountInvested === 0) return 0;
    return (investment.totalInterestAccrued / investment.amountInvested) * 100;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatPercentage = (rate: number): string => {
    return `${(rate || 0).toFixed(2)}%`;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status: string): string => {
    switch(status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "maturing-soon":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "matured":
        return "bg-slate-100 text-slate-600 border border-slate-200";
      default:
        return "bg-blue-50 text-blue-700 border border-blue-200";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch(status) {
      case "active": return "Active";
      case "maturing-soon": return "Maturing Soon";
      case "matured": return "Matured";
      default: return status;
    }
  };

  // Fetch Data
  useEffect(() => {
    // Only fetch if userId is present. 
    if (!userId) return;

    const fetchInvestments = async () => {
      setLoading(true);
      setError(null);
      try {
        // Construct API URL with server-side pagination
        let apiUrl = `${url}/kamakfund/rest/kamak/customer/${userId}/commercial-paper-investments?page=${currentPage}&pageSize=${pageSize}`;
        
        // MOCKING API RESPONSE FOR DEMONSTRATION IF NO URL
        let data: ApiResponse;
        if (!url && process.env.NODE_ENV !== 'production') {
           // Simulate network delay
           await new Promise(r => setTimeout(r, 800));
           data = {
             status: 1,
             data: Array.from({ length: pageSize }).map((_, i) => ({
               id: 1000 + i + (currentPage * 10),
               amountInvested: 5000 + (Math.random() * 10000),
               dailyInterest: 15.5,
               interestRate: 18 + (Math.random() * 5),
               faceValue: 6000 + (Math.random() * 10000),
               maturityDate: new Date(Date.now() + (Math.random() * 86400000 * 90) - 86400000 * 10).toISOString(),
               nextPaymentDate: new Date().toISOString(),
               principalPayment: 5000,
               totalInterestAccrued: 250 + (Math.random() * 500),
               totalPayment: 6250,
               tradeDate: new Date(Date.now() - 86400000 * 100).toISOString(),
               customerId: 123
             })),
             pagination: {
               currentPage,
               pageSize,
               totalRecords: 145, // Mock total
               totalPages: Math.ceil(145 / pageSize)
             }
           };
        } else {
           const response = await fetch(apiUrl, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });

          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          data = await response.json();
        }

        if (data.status === 1) {
          setInvestments(data.data);
          if (data.pagination) {
            setTotalRecords(data.pagination.totalRecords);
            setTotalPages(data.pagination.totalPages);
            if (data.pagination.currentPage !== currentPage) {
               setCurrentPage(data.pagination.currentPage);
            }
          }
          
          const pageInvested = data.data.reduce((sum, inv) => sum + (inv.amountInvested || 0), 0);
          const pageFaceValue = data.data.reduce((sum, inv) => sum + (inv.faceValue || 0), 0);
          const pageInterest = data.data.reduce((sum, inv) => sum + (inv.totalInterestAccrued || 0), 0);
          const pageAvgRate = data.data.length > 0 
            ? data.data.reduce((sum, inv) => sum + (inv.interestRate || 0), 0) / data.data.length 
            : 0;
            
          setStats({
            totalInvested: pageInvested,
            totalFaceValue: pageFaceValue,
            totalInterestAccrued: pageInterest,
            avgInterestRate: pageAvgRate,
            activeCount: data.data.length
          });

        } else {
          setError(data.message || "Failed to fetch investments");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Error fetching commercial paper investments");
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, [userId, url, currentPage, pageSize]);

  // Client-side filtering logic
  const filteredInvestments = investments.filter((inv) => {
    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matches = 
        inv.id?.toString().includes(term) ||
        inv.amountInvested?.toString().includes(term);
      if (!matches) return false;
    }

    // Numeric Filters
    if (filterMinInvestment && inv.amountInvested < parseFloat(filterMinInvestment)) return false;
    if (filterMaxInvestment && inv.amountInvested > parseFloat(filterMaxInvestment)) return false;
    if (filterMinInterestRate && inv.interestRate < parseFloat(filterMinInterestRate)) return false;
    if (filterMaxInterestRate && inv.interestRate > parseFloat(filterMaxInterestRate)) return false;
    if (filterMinFaceValue && inv.faceValue < parseFloat(filterMinFaceValue)) return false;
    if (filterMaxFaceValue && inv.faceValue > parseFloat(filterMaxFaceValue)) return false;
    
    // Status Filter
    if (filterMaturityStatus !== "all") {
      const status = getMaturityStatus(inv);
      if (status !== filterMaturityStatus) return false;
    }

    // Year Filter
    if (filterTradeYear !== "all") {
      const year = new Date(inv.tradeDate).getFullYear().toString();
      if (year !== filterTradeYear) return false;
    }

    return true;
  });

  // Reset Logic
  const resetFilters = () => {
    setSearchTerm("");
    setFilterMinInvestment("");
    setFilterMaxInvestment("");
    setFilterMinInterestRate("");
    setFilterMaxInterestRate("");
    setFilterMinFaceValue("");
    setFilterMaxFaceValue("");
    setFilterMaturityStatus("all");
    setFilterTradeYear("all");
  };

  const hasActiveFilters = 
    searchTerm !== "" || 
    filterMinInvestment !== "" || 
    filterMaxInvestment !== "" || 
    filterMinInterestRate !== "" || 
    filterMaxInterestRate !== "" ||
    filterMinFaceValue !== "" ||
    filterMaxFaceValue !== "" ||
    filterMaturityStatus !== "all" ||
    filterTradeYear !== "all";

  // Unique Years for dropdown
  const uniqueYears = Array.from(new Set(investments.map(i => new Date(i.tradeDate).getFullYear()))).sort((a,b) => b-a);

  // Loading State
  if (loading && investments.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600 text-sm font-medium">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8 max-w-md text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-slate-900 text-lg font-semibold mb-2">Unable to Load Data</h3>
          <p className="text-slate-600 text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate Pagination Range
  const getPaginationRange = () => {
    const range: (number | string)[] = [];
    const showPages = 5;
    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= showPages; i++) range.push(i);
        range.push("...");
        range.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        range.push(1);
        range.push("...");
        for (let i = totalPages - showPages + 1; i <= totalPages; i++) range.push(i);
      } else {
        range.push(1);
        range.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) range.push(i);
        range.push("...");
        range.push(totalPages);
      }
    }
    return range;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shadow-md">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Commercial Paper</h1>
              <p className="text-sm text-slate-600">Fixed income security portfolio overview</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Active Accounts (Count) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-stone-700" />
              </div>
            </div>
            <p className="text-xs text-red-500 uppercase tracking-wider font-semibold">Active Instruments</p>
            <p className="text-xl font-semibold text-slate-900">{stats.activeCount}</p>
          </div>

          {/* Card 2: Total Invested */}
          <div className="bg-white rounded-xl relative overflow-hidden shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md">
            <InvestmentSummaryDesign/>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-stone-700" />
              </div>
            </div>
            <p className="text-xs text-red-500 uppercase tracking-wider font-semibold">Total Invested (Page)</p>
            <p className="text-xl font-semibold text-slate-900">{formatCurrency(stats.totalInvested)}</p>
          </div>

          {/* Card 3: Face Value */}
          <div className="bg-white rounded-xl relative overflow-hidden shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md">
            <InvestmentSummaryDesign/>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-stone-700" />
              </div>
            </div>
            <p className="text-xs text-red-500 uppercase tracking-wider font-semibold">Total Face Value</p>
            <p className="text-xl font-semibold text-slate-900">{formatCurrency(stats.totalFaceValue)}</p>
          </div>

          {/* Card 4: Interest Accrued */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-stone-700" />
              </div>
            </div>
            <p className="text-xs text-red-500 uppercase tracking-wider font-semibold">Interest Accrued</p>
            <p className="text-xl font-semibold text-slate-900">{formatCurrency(stats.totalInterestAccrued)}</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by ID or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-slate-600 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50 transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                showFilters || hasActiveFilters
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 bg-white text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border border-slate-200">
                  {[searchTerm, filterMinInvestment, filterMaxInvestment, filterMinInterestRate, filterMaxInterestRate, filterMinFaceValue, filterMaxFaceValue, filterMaturityStatus !== "all", filterTradeYear !== "all"].filter(Boolean).length}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>

          {/* Expanded Filter Panel */}
          {showFilters && (
            <div className="mt-5 pt-5 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Investment Range */}
                <div className="space-y-3">
                   <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Investment Amount</h4>
                   <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filterMinInvestment}
                      onChange={(e) => setFilterMinInvestment(e.target.value)}
                      className="w-full px-3 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filterMaxInvestment}
                      onChange={(e) => setFilterMaxInvestment(e.target.value)}
                      className="w-full px-3 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50"
                    />
                   </div>
                </div>

                {/* Face Value Range - Added back */}
                <div className="space-y-3">
                   <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Face Value</h4>
                   <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filterMinFaceValue}
                      onChange={(e) => setFilterMinFaceValue(e.target.value)}
                      className="w-full px-3 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filterMaxFaceValue}
                      onChange={(e) => setFilterMaxFaceValue(e.target.value)}
                      className="w-full px-3 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50"
                    />
                   </div>
                </div>

                {/* Interest Rate */}
                <div className="space-y-3">
                   <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interest Rate (%)</h4>
                   <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Min %"
                      value={filterMinInterestRate}
                      onChange={(e) => setFilterMinInterestRate(e.target.value)}
                      className="w-full px-3 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Max %"
                      value={filterMaxInterestRate}
                      onChange={(e) => setFilterMaxInterestRate(e.target.value)}
                      className="w-full px-3 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50"
                    />
                   </div>
                </div>

                {/* Status Dropdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Maturity Status</h4>
                  <select
                    value={filterMaturityStatus}
                    onChange={(e) => setFilterMaturityStatus(e.target.value)}
                    className="w-full px-3 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="maturing-soon">Maturing Soon (≤30 days)</option>
                    <option value="matured">Matured</option>
                  </select>
                </div>

                {/* Year Dropdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trade Year</h4>
                  <select
                    value={filterTradeYear}
                    onChange={(e) => setFilterTradeYear(e.target.value)}
                    className="w-full px-3 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50"
                  >
                    <option value="all">All Years</option>
                    {uniqueYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Bar */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <FileText className="w-4 h-4" />
            <span>
              Showing <span className="font-semibold text-slate-900">{startItem}</span> to <span className="font-semibold text-slate-900">{endItem}</span> of <span className="font-semibold text-slate-900">{totalRecords}</span> records
              {hasActiveFilters && " (filtered)"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600 font-medium">Rows per page:</label>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none pl-3 pr-8 py-1.5 text-sm text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white cursor-pointer shadow-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredInvestments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No investments found</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                We couldn't find any records matching your current filters. Try adjusting your search criteria.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase whitespace-nowrap">Investment ID</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase whitespace-nowrap">Amount Invested</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase whitespace-nowrap">Face Value</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase whitespace-nowrap">Interest Rate</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase whitespace-nowrap">Interest Accrued</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase whitespace-nowrap">Daily Interest</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase whitespace-nowrap">Maturity Date</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredInvestments.map((investment) => {
                    const maturityStatus = getMaturityStatus(investment);
                    const daysToMaturity = calculateDaysToMaturity(investment.maturityDate);
                    const yieldPercent = calculateYield(investment);

                    return (
                      <tr key={investment.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-slate-900 font-semibold">
                              ID: {investment.id}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Trade: {formatDate(investment.tradeDate)}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Yield: {formatPercentage(yieldPercent)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-slate-900 font-bold">
                            {formatCurrency(investment.amountInvested)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-slate-700 font-medium">
                            {formatCurrency(investment.faceValue)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {formatPercentage(investment.interestRate)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-emerald-600">
                              {formatCurrency(investment.totalInterestAccrued)}
                            </span>
                            <span className="text-xs text-slate-400 mt-1">
                              Total: {formatCurrency(investment.totalPayment)}
                            </span>
                          </div>  
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-slate-700">  
                            {formatCurrency(investment.dailyInterest)}
                          </span>
                        </td> 
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm text-slate-900 font-medium">  
                              {formatDate(investment.maturityDate)}
                            </span>
                            <span className="text-xs text-slate-400 mt-1"> 
                              ({daysToMaturity} days)
                            </span>
                          </div>  
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span 
                            className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(maturityStatus)}`}
                          >
                            {getStatusLabel(maturityStatus)}    
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all w-full sm:w-auto ${ 
              currentPage === 1 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent" 
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm"  
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="hidden sm:flex items-center gap-1">
            {getPaginationRange().map((page, index) => 
              page === "..." ? (    
                <span key={`dots-${index}`} className="px-3 py-2 text-sm text-slate-400 font-medium">...</span>
              ) : (    
                <button   
                  key={page}
                  onClick={() => setCurrentPage(Number(page))}   
                  className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${   
                    page === currentPage   
                      ? "bg-slate-900 text-white shadow-md transform scale-105"   
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"   
                  }`}  
                >   
                  {page}  
                </button>  
              )  
            )}  
          </div>

          <div className="sm:hidden text-sm text-slate-600 font-medium">
            Page {currentPage} of {totalPages}
          </div>

          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all w-full sm:w-auto ${ 
              currentPage === totalPages || totalPages === 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent" 
                : "bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg"  
            }`}   
          >
            Next
            <ChevronRight className="w-4 h-4" />  
          </button>
        </div>

      </div>
    </div>
  );
}

export default CommercialPaperInvestments;