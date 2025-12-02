import { useEffect, useState } from "react";
import { Search, Filter, X, ChevronDown, Calendar, ChevronLeft, ChevronRight, TrendingUp, DollarSign, Percent, Clock, Shield, RefreshCw, Landmark, ArrowUpRight, ArrowDownRight } from "lucide-react";
import InvestmentSummaryDesign from "../../Components/investment_summary_design";

interface Bond {
  id: number;
  securityName: string;
  currentValue: number;
  faceValue: number;
  principal: string;
  maturityDate: string;
  couponRate: number;
  nextCoupon: number;
  tenorInDays: number;
  nextCouponDate: string;
  tradeDate: string;
}

interface Pagination {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

interface ApiResponse {
  status: number;
  data: Bond[];
  pagination: Pagination;
  message?: string;
}

function BondInvestments() {
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [filteredBonds, setFilteredBonds] = useState<Bond[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    pageSize: 20,
    totalRecords: 0,
    totalPages: 0
  });
  
  const [filterPerformance, setFilterPerformance] = useState<string>("all");
  const [filterMaturity, setFilterMaturity] = useState<string>("all");
  const [filterMinCoupon, setFilterMinCoupon] = useState<string>("");
  const [filterMaxCoupon, setFilterMaxCoupon] = useState<string>("");
  const [filterMinValue, setFilterMinValue] = useState<string>("");
  const [filterMaxValue, setFilterMaxValue] = useState<string>("");

  const [userId, setUserId] = useState<string>("");
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

  useEffect(() => {
    const fetchBonds = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const response = await fetch(
          `${url}/kamakfund/rest/kamak/customer/${userId}/bond-investments?page=${currentPage}&pageSize=${pageSize}`,
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
          setBonds(data.data);
          setFilteredBonds(data.data);
          setPagination(data.pagination);
        } else {
          setError(data.message || "Failed to fetch bonds");
        }
      } catch (err) {
        console.error("Error fetching bond investments:", err);
        setError("Error fetching bond investments");
      } finally {
        setLoading(false);
      }
    };

    fetchBonds();
  }, [userId, currentPage, pageSize]);

  useEffect(() => {
    let filtered = [...bonds];

    if (searchTerm) {
      filtered = filtered.filter(
        (bond) =>
          bond.securityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bond.id.toString().includes(searchTerm)
      );
    }

    if (filterPerformance !== "all") {
      filtered = filtered.filter((bond) => {
        const diff = bond.currentValue - bond.faceValue;
        return filterPerformance === "premium" ? diff > 0 : diff < 0;
      });
    }

    if (filterMaturity !== "all") {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filterMaturity) {
        case "3months":
          cutoffDate.setMonth(now.getMonth() + 3);
          break;
        case "6months":
          cutoffDate.setMonth(now.getMonth() + 6);
          break;
        case "1year":
          cutoffDate.setFullYear(now.getFullYear() + 1);
          break;
        case "2years":
          cutoffDate.setFullYear(now.getFullYear() + 2);
          break;
      }

      filtered = filtered.filter((bond) => {
        const maturityDate = new Date(bond.maturityDate);
        return maturityDate <= cutoffDate;
      });
    }

    if (filterMinCoupon) {
      const minCoupon = parseFloat(filterMinCoupon);
      filtered = filtered.filter((bond) => bond.couponRate >= minCoupon);
    }

    if (filterMaxCoupon) {
      const maxCoupon = parseFloat(filterMaxCoupon);
      filtered = filtered.filter((bond) => bond.couponRate <= maxCoupon);
    }

    if (filterMinValue) {
      const minVal = parseFloat(filterMinValue);
      filtered = filtered.filter((bond) => bond.currentValue >= minVal);
    }

    if (filterMaxValue) {
      const maxVal = parseFloat(filterMaxValue);
      filtered = filtered.filter((bond) => bond.currentValue <= maxVal);
    }

    setFilteredBonds(filtered);
  }, [bonds, searchTerm, filterPerformance, filterMaturity, filterMinCoupon, filterMaxCoupon, filterMinValue, filterMaxValue]);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterPerformance("all");
    setFilterMaturity("all");
    setFilterMinCoupon("");
    setFilterMaxCoupon("");
    setFilterMinValue("");
    setFilterMaxValue("");
  };

  const hasActiveFilters = 
    searchTerm !== "" || 
    filterPerformance !== "all" || 
    filterMaturity !== "all" || 
    filterMinCoupon !== "" || 
    filterMaxCoupon !== "" || 
    filterMinValue !== "" || 
    filterMaxValue !== "";

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntil = (dateString: string): number => {
    return Math.ceil((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const { currentPage, totalPages } = pagination;
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600 text-sm font-medium">Loading your bond investments...</p>
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
          <h3 className="text-slate-900 text-lg font-semibold mb-2">Unable to Load Bonds</h3>
          <p className="text-slate-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const totalValue = filteredBonds.reduce((sum, bond) => sum + (bond.currentValue || 0), 0);
  const totalFaceValue = filteredBonds.reduce((sum, bond) => sum + (bond.faceValue || 0), 0);
  const totalNextCoupon = filteredBonds.reduce((sum, bond) => sum + (bond.nextCoupon || 0), 0);
  const totalCoupon = filteredBonds.reduce(
    (sum, bond) => sum + (bond.faceValue * (bond.couponRate / 100) * (bond.tenorInDays / 365)),
    0
  );
  const totalGains = totalValue - totalFaceValue;
  const averageRate = filteredBonds.length > 0 
    ? (filteredBonds.reduce((sum, bond) => sum + bond.couponRate, 0) / filteredBonds.length).toFixed(2)
    : "0.00";

  const startItem = pagination.totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, pagination.totalRecords);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Bond Investments</h1>
              <p className="text-sm text-slate-600">Fixed income portfolio overview</p>
            </div>
          </div>
        </div>

        
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <Landmark className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <p className="text-xs text-red-500 uppercase tracking-wider font-semibold">Number of Bonds</p>
            <p className="text-xl font-semibold text-slate-900">{filteredBonds.length}</p>
            <p className="text-xs text-slate-500 mt-2">Active securities</p>
          </div>

          <div className="bg-white rounded-xl relative overflow-hidden shadow-sm border border-slate-200 p-6">
            <InvestmentSummaryDesign />
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <p className="text-xs text-red-500 uppercase tracking-wider font-semibold">Total Face Value</p>
            <p className="text-xl font-semibold text-slate-900">{formatCurrency(totalFaceValue)}</p>
            <p className="text-xs text-slate-500 mt-2">Principal invested</p>
          </div>

          <div className="bg-white rounded-xl relative overflow-hidden  shadow-sm border border-slate-200 p-6">
            <InvestmentSummaryDesign />
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <p className="text-xs text-red-500 uppercase tracking-wider font-semibold">Current Value</p>
            <p className="text-xl font-semibold text-slate-900">{formatCurrency(totalValue)}</p>
            <div className="flex items-center gap-1 mt-2">
              {totalGains >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-emerald-600" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-red-600" />
              )}
              <p className={`text-xs font-medium ${totalGains >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {totalGains >= 0 ? '+' : ''}{formatCurrency(totalGains)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <Percent className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <p className="text-xs text-red-500 uppercase tracking-wider font-semibold">Total Coupon</p>
            <p className="text-xl font-semibold text-slate-900">{formatCurrency(totalCoupon)}</p>
            <p className="text-xs text-slate-500 mt-2">Next: {formatCurrency(totalNextCoupon)}</p>
          </div>
        </div>

        {/* Search and Filter Bar */ }

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by security name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-white text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {[searchTerm, filterPerformance !== "all", filterMaturity !== "all", filterMinCoupon, filterMaxCoupon, filterMinValue, filterMaxValue].filter(Boolean).length}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-5 pt-5 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                    Performance vs Face Value
                  </label>
                  <select
                    value={filterPerformance}
                    onChange={(e) => setFilterPerformance(e.target.value)}
                    className="w-full px-3 py-2.5 text-slate-700 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="all">All Bonds</option>
                    <option value="premium">Trading at Premium</option>
                    <option value="discount">Trading at Discount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                    Maturity Period
                  </label>
                  <select
                    value={filterMaturity}
                    onChange={(e) => setFilterMaturity(e.target.value)}
                    className="w-full px-3 py-2.5 text-slate-700 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="all">All Maturities</option>
                    <option value="3months">Within 3 Months</option>
                    <option value="6months">Within 6 Months</option>
                    <option value="1year">Within 1 Year</option>
                    <option value="2years">Within 2 Years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                    Min Coupon Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={filterMinCoupon}
                    onChange={(e) => setFilterMinCoupon(e.target.value)}
                    className="w-full px-3 py-2.5 border text-slate-700 border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                    Max Coupon Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="No limit"
                    value={filterMaxCoupon}
                    onChange={(e) => setFilterMaxCoupon(e.target.value)}
                    className="w-full px-3 py-2.5 text-slate-700 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                    Min Current Value
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filterMinValue}
                    onChange={(e) => setFilterMinValue(e.target.value)}
                    className="w-full px-3 py-2.5 text-slate-700 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                    Max Current Value
                  </label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={filterMaxValue}
                    onChange={(e) => setFilterMaxValue(e.target.value)}
                    className="w-full px-3 py-2.5 text-slate-700 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Results Count and Page Size */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Shield className="w-4 h-4" />
            <span>
              Showing <span className="font-semibold text-slate-900">{startItem}-{endItem}</span> of{' '}
              <span className="font-semibold text-slate-900">{pagination.totalRecords}</span> bonds
              {hasActiveFilters && " (filtered)"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Show:</label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Bonds Table */}
        {filteredBonds.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No bonds found</h3>
            <p className="text-slate-600 text-sm mb-4">
              Try adjusting your filters or search criteria
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase whitespace-nowrap tracking-wide">
                        Security Name
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase whitespace-nowrap tracking-wide">
                        Face Value
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase whitespace-nowrap tracking-wide">
                        Current Value
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase whitespace-nowrap tracking-wide">
                        Coupon Rate
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase whitespace-nowrap tracking-wide">
                        Next Coupon
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase whitespace-nowrap tracking-wide">
                        Tenor
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase whitespace-nowrap tracking-wide">
                        Trade Date
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase whitespace-nowrap tracking-wide">
                        Principal
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase whitespace-nowrap tracking-wide">
                        Maturity Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredBonds.map((bond) => {
                      const valueChange = bond.faceValue > 0 
                        ? ((bond.currentValue - bond.faceValue) / bond.faceValue * 100).toFixed(2) 
                        : "0.00";
                      const daysToNextCoupon = bond.nextCouponDate 
                        ? getDaysUntil(bond.nextCouponDate) 
                        : null;
                      const daysToMaturity = getDaysUntil(bond.maturityDate);

                      return (
                        <tr key={bond.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{bond.securityName}</p>
                              {daysToNextCoupon !== null && daysToNextCoupon > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <p className="text-xs text-slate-500">
                                    Next coupon in {daysToNextCoupon} days
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm text-slate-900 font-medium">{formatCurrency(bond.faceValue)}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-right">
                              <span className="text-sm text-slate-900 font-bold">{formatCurrency(bond.currentValue)}</span>
                              {bond.faceValue > 0 && (
                                <div className="flex items-center justify-end gap-1 mt-1">
                                  {parseFloat(valueChange) >= 0 ? (
                                    <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <ArrowDownRight className="w-3 h-3 text-red-600" />
                                  )}
                                  <p className={`text-xs font-medium ${parseFloat(valueChange) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {parseFloat(valueChange) >= 0 ? '+' : ''}{valueChange}%
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-sm font-semibold bg-slate-50 text-slate-900 rounded-full border border-slate-200 font-mono">
                              {bond.couponRate.toFixed(2)}%
                            </span> 
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm text-slate-900 font-medium">{formatCurrency(bond.nextCoupon)}</span> 
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm text-slate-900 font-medium">{bond.tenorInDays} days</span> 
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm text-slate-900 font-medium">{formatDate(bond.tradeDate)}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm text-slate-900 font-medium">{bond.principal}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div>
                              <span className="text-sm text-slate-900 font-medium">{formatDate(bond.maturityDate)}</span>
                              {daysToMaturity > 0 && (
                                <div className="flex items-center gap-1 mt-1 justify-end">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <p className="text-xs text-slate-500">
                                    Matures in {daysToMaturity} days  
                                  </p>
                                </div>
                              )}  
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">  
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}  
                  className={`p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ChevronLeft className="w-4 h-4" /> 
                </button>
                {getPageNumbers().map((page, index) => (
                  <button 
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={page === '...'} 
                    className={`px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors ${page === currentPage ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800' : ''} ${page === '...' ? 'cursor-default' : ''}`}
                  >
                    {page}  
                  </button>
                ))}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}  
                  className={`p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors ${currentPage === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}  
                >
                  <ChevronRight className="w-4 h-4" /> 
                </button> 
              </div>
            </div>
          </> 
        )}
      </div>
    </div>
  );
}
export default BondInvestments;