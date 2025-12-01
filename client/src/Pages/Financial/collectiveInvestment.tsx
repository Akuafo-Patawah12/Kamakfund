import { useEffect, useState } from "react";
import { Search, Filter, X, ChevronDown, TrendingUp, Wallet, PieChart, DollarSign, Activity, RefreshCw, FileText, ChevronLeft, ChevronRight } from "lucide-react";

interface CollectiveInvestment {
  investmentName: string;
  totalUnits: number;
  unitPrice: number;
  lastContributionDate: string;
  lastTransactionAmount: number;
  paymentFrequency: string;
  investmentDate: string;
  cost: number;
  fees: number;
  initial_price: number;
  current_price: number;
  gains_loss: number;
  status: string;
  refNo: string;
  lastValuationDate: string;
  cashBalance?: number;
  paymentStatus?: string;
  valuation: number;
}

interface ApiResponse {
  status: number;
  data: CollectiveInvestment[];
  message?: string;
  offset: number;
  limit: number;
  count: number;
}

function CollectiveInvestments() {
  const [investments, setInvestments] = useState<CollectiveInvestment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all");
  const [filterPaymentFrequency, setFilterPaymentFrequency] = useState<string>("all");
  const [filterMinValuation, setFilterMinValuation] = useState<string>("");
  const [filterMaxValuation, setFilterMaxValuation] = useState<string>("");
  const [filterMinUnits, setFilterMinUnits] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  // Stats states (for total calculations)
  const [totalStats, setTotalStats] = useState({
    totalValuation: 0,
    totalCashBalance: 0,
    totalUnits: 0,
    totalAccounts: 0
  });

  const url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const storedUser = localStorage.getItem("userId");

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed) {
          setUserId(parsed);
        } else if (typeof parsed === "string") {
          setUserId(parsed);
        }
      } catch {
        setUserId(storedUser);
      }
    }
  }, []);

  // Fetch all investments for stats calculation (without pagination)
  const fetchAllStats = async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `${url}/kamakfund/rest/kamak/customer/${userId}/collective-investments?offset=0&limit=10000`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data: ApiResponse = await response.json();
        if (data.status === 1) {
          const stats = data.data.reduce((acc, inv) => ({
            totalValuation: acc.totalValuation + (inv.valuation || 0),
            totalCashBalance: acc.totalCashBalance + (inv.cashBalance || 0),
            totalUnits: acc.totalUnits + (inv.totalUnits || 0),
            totalAccounts: acc.totalAccounts + 1
          }), { totalValuation: 0, totalCashBalance: 0, totalUnits: 0, totalAccounts: 0 });
          
          setTotalStats(stats);
          setTotalItems(data.data.length);
        }
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Fetch paginated investments
  const fetchInvestments = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await fetch(
        `${url}/kamakfund/rest/kamak/customer/${userId}/collective-investments?offset=${offset}&limit=${itemsPerPage}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.status === 1) {
        setInvestments(data.data);
      } else {
        setError(data.message || "Failed to fetch collective investments");
      }
    } catch (err) {
      console.error("Error fetching collective investments:", err);
      setError("Error fetching collective investments");
    } finally {
      setLoading(false);
    }
  };

  // Initial load - fetch stats
  useEffect(() => {
    fetchAllStats();
  }, [userId, url]);

  // Fetch investments when pagination changes
  useEffect(() => {
    fetchInvestments();
  }, [userId, url, currentPage, itemsPerPage]);

  // Client-side filtering
  const filteredInvestments = investments.filter((inv) => {
    // Search filter
    if (searchTerm) {
      const matchesSearch = 
        inv.investmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.refNo?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filterStatus !== "all" && inv.status?.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }

    // Payment status filter
    if (filterPaymentStatus !== "all" && inv.paymentStatus?.toLowerCase() !== filterPaymentStatus.toLowerCase()) {
      return false;
    }

    // Payment frequency filter
    if (filterPaymentFrequency !== "all" && inv.paymentFrequency?.toLowerCase() !== filterPaymentFrequency.toLowerCase()) {
      return false;
    }

    // Valuation filters
    if (filterMinValuation) {
      const minVal = parseFloat(filterMinValuation);
      if (inv.valuation < minVal) return false;
    }

    if (filterMaxValuation) {
      const maxVal = parseFloat(filterMaxValuation);
      if (inv.valuation > maxVal) return false;
    }

    // Units filter
    if (filterMinUnits) {
      const minUnits = parseFloat(filterMinUnits);
      if (inv.totalUnits < minUnits) return false;
    }

    return true;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterPaymentStatus("all");
    setFilterPaymentFrequency("all");
    setFilterMinValuation("");
    setFilterMaxValuation("");
    setFilterMinUnits("");
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    searchTerm !== "" || 
    filterStatus !== "all" || 
    filterPaymentStatus !== "all" || 
    filterPaymentFrequency !== "all" || 
    filterMinValuation !== "" || 
    filterMaxValuation !== "" || 
    filterMinUnits !== "";

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
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
    if (!status) return "bg-slate-100 text-slate-700";
    const statusLower = status.toLowerCase();
    if (statusLower === "active") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    if (statusLower === "inactive" || statusLower === "closed") return "bg-slate-100 text-slate-600 border border-slate-200";
    if (statusLower === "pending") return "bg-amber-50 text-amber-700 border border-amber-200";
    return "bg-blue-50 text-blue-700 border border-blue-200";
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPaginationRange = () => {
    const range: (number | string)[] = [];
    const showPages = 5;
    
    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
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

  const uniqueStatuses = Array.from(new Set(investments.map(inv => inv.status).filter(Boolean)));
  const uniquePaymentStatuses = Array.from(new Set(investments.map(inv => inv.paymentStatus).filter(Boolean)));
  const uniqueFrequencies = Array.from(new Set(investments.map(inv => inv.paymentFrequency).filter(Boolean)));

  if (loading && investments.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600 text-sm font-medium">Loading your investments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8 max-w-md">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <X className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-slate-900 text-lg font-semibold mb-2">Unable to Load Investments</h3>
          <p className="text-slate-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Collective Investments</h1>
              <p className="text-sm text-slate-600">Unit trust and mutual fund portfolio overview</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">Total Accounts</p>
            <p className="text-2xl font-bold text-slate-900">{totalStats.totalAccounts}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">Total Units</p>
            <p className="text-2xl font-bold text-slate-900">
              {totalStats.totalUnits.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">Total Valuation</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalStats.totalValuation)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">Cash Balance</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalStats.totalCashBalance)}</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by account number or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-slate-600 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                showFilters || hasActiveFilters
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-white text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {[searchTerm, filterStatus !== "all", filterPaymentStatus !== "all", filterPaymentFrequency !== "all", filterMinValuation, filterMaxValuation, filterMinUnits].filter(Boolean).length}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-5 pt-5 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Account Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2.5 text-slate-600 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50"
                  >
                    <option value="all">All Statuses</option>
                    {uniqueStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Payment Status</label>
                  <select
                    value={filterPaymentStatus}
                    onChange={(e) => setFilterPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2.5 text-slate-600 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50"
                  >
                    <option value="all">All Payment Statuses</option>
                    {uniquePaymentStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Payment Frequency</label>
                  <select
                    value={filterPaymentFrequency}
                    onChange={(e) => setFilterPaymentFrequency(e.target.value)}
                    className="w-full px-3 py-2.5 text-slate-600 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50"
                  >
                    <option value="all">All Frequencies</option>
                    {uniqueFrequencies.map(freq => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Min Valuation (GHS)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filterMinValuation}
                    onChange={(e) => setFilterMinValuation(e.target.value)}
                    className="w-full px-3 py-2.5 text-slate-600 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Max Valuation (GHS)</label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={filterMaxValuation}
                    onChange={(e) => setFilterMaxValuation(e.target.value)}
                    className="w-full px-3 py-2.5 text-slate-600 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Min Units</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filterMinUnits}
                    onChange={(e) => setFilterMinUnits(e.target.value)}
                    className="w-full px-3 py-2.5 text-slate-600 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count and Items Per Page */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <FileText className="w-4 h-4" />
            <span>
              Showing <span className="font-semibold text-slate-900">{startItem}</span> to <span className="font-semibold text-slate-900">{endItem}</span> of <span className="font-semibold text-slate-900">{totalItems}</span> accounts
              {hasActiveFilters && " (filtered)"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Items per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-sm text-stone-700  border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value={5} className="text-stone-700">5</option>
              <option value={10} className="text-stone-700">10</option>
              <option value={20} className="text-stone-700">20</option>
              <option value={50} className="text-stone-700">50</option>
              <option value={100} className="text-stone-700">100</option>
            </select>
          </div>
        </div>

        {/* Investments Table */}
        {filteredInvestments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No investments found</h3>
            <p className="text-slate-600 text-sm mb-6">
              Try adjusting your filters or search criteria
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Investment Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Investment Name</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Units</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Valuation</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Cash Balance</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Last Contribution</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Frequency</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Cost</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Initial Price</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Current Price</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Fees</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Gains/Loss</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredInvestments.map((investment, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700 font-medium">
                            {formatDate(investment.investmentDate)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {investment.investmentName || "N/A"}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Ref: {investment.refNo || "N/A"}
                            </p>
                            {investment.lastValuationDate && (
                              <p className="text-xs text-slate-500 mt-1">
                                Valued: {formatDate(investment.lastValuationDate)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-slate-900 font-mono font-medium">
                            {investment.totalUnits.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-slate-900 font-bold">
                            {formatCurrency(investment.valuation)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-slate-900 font-bold"> 
                            {formatCurrency(investment.cashBalance || 0)}
                          </span>
                        </td> 
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-slate-700 font-medium">
                            {formatCurrency(investment.lastTransactionAmount)}  
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">  
                          <span className="text-sm text-slate-700 font-medium">
                            {investment.paymentFrequency || "N/A"}
                          </span> 
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-slate-700 font-medium"> 
                            {formatCurrency(investment.cost)}
                          </span>
                        </td> 
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-slate-700 font-medium">
                            {formatCurrency(investment.initial_price)}  
                          </span>
                        </td> 
                        <td className="px-6 py-4 text-center">  
                          <span className="text-sm text-slate-700 font-medium">
                            {formatCurrency(investment.current_price)}  
                          </span> 
                        </td>   
                        <td className="px-6 py-4 text-center">  
                          <span className="text-sm text-slate-700 font-medium">
                            {formatCurrency(investment.fees)}
                          </span> 
                        </td> 
                        <td className="px-6 py-4 text-center">  
                          <span className="text-sm text-slate-700 font-medium">
                            {formatCurrency(investment.gains_loss)}  
                          </span> 
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(investment.status)}`}>    
                            {investment.status || "N/A"}  
                          </span> 
                        </td> 
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>  
            {/* Pagination Controls */}
            <div className="mt-6 flex items-center justify-between">
              <button 
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${ 
                  currentPage === 1 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-slate-900 text-white hover:bg-slate-800 shadow-sm"  
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button> 
              <div className="flex items-center gap-2">
                {getPaginationRange().map((page, index) => 
                  page === "..." ? (    
                    <span key={index} className="px-2 text-sm text-slate-500">...</span>
                  ) : (    
                    <button   
                      key={index}
                      onClick={() => goToPage(Number(page))}   
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${   
                        page === currentPage   
                          ? "bg-slate-900 text-white shadow-sm"   
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100"   
                      }`}  
                    >   
                      {page}  
                    </button>  
                  )  
                )}  
              </div>
              <button 
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${ 
                  currentPage === totalPages  
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-slate-900 text-white hover:bg-slate-800 shadow-sm"  
                }`}   
              >
                Next
                <ChevronRight className="w-4 h-4" />  
              </button>
            </div>
          </> 
        )}
      </div>
    </div>
  );
}   
export default CollectiveInvestments;