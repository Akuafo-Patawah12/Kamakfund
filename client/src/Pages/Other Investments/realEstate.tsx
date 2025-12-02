import React, { useEffect, useState } from "react";
import { Search, Filter, X, ChevronDown, Building2, TrendingUp, ChevronLeft, ChevronRight, Wallet, DollarSign, PieChart, TrendingDown } from "lucide-react";
import InvestmentSummaryDesign from "../../Components/investment_summary_design";

interface RealEstateInvestment {
  id: number;
  description: string;
  currentValue: number;
  totalAmountInvested: number;
  status: string;
  dateStarted: string;
  realEstateClassId: number;
  realEstateProductId: number;
}

interface Pagination {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

interface ApiResponse {
  status: number;
  data: RealEstateInvestment[];
  pagination: Pagination;
  message?: string;
}

function RealEstateInvestments() {
  const [investments, setInvestments] = useState<RealEstateInvestment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0
  });
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMinValue, setFilterMinValue] = useState<string>("");
  const [filterMaxValue, setFilterMaxValue] = useState<string>("");
  const [filterMinInvested, setFilterMinInvested] = useState<string>("");
  const [filterMaxInvested, setFilterMaxInvested] = useState<string>("");
  const [filterMinReturn, setFilterMinReturn] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  // Stats states (for overall portfolio, not filtered)
  const [totalStats, setTotalStats] = useState({
    totalInvestments: 0,
    totalInvested: 0,
    totalCurrentValue: 0,
    totalGainLoss: 0,
    overallReturn: 0
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

  // Calculate return percentage
  const calculateReturn = (investment: RealEstateInvestment): number => {
    if (investment.totalAmountInvested === 0) return 0;
    return ((investment.currentValue - investment.totalAmountInvested) / investment.totalAmountInvested) * 100;
  };

  // Apply client-side filters
  const applyClientFilters = (data: RealEstateInvestment[]): RealEstateInvestment[] => {
    let filtered = [...data];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.id?.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((inv) => inv.status?.toLowerCase() === filterStatus.toLowerCase());
    }

    // Min current value filter
    if (filterMinValue) {
      const minVal = parseFloat(filterMinValue);
      filtered = filtered.filter((inv) => inv.currentValue >= minVal);
    }

    // Max current value filter
    if (filterMaxValue) {
      const maxVal = parseFloat(filterMaxValue);
      filtered = filtered.filter((inv) => inv.currentValue <= maxVal);
    }

    // Min invested filter
    if (filterMinInvested) {
      const minInv = parseFloat(filterMinInvested);
      filtered = filtered.filter((inv) => inv.totalAmountInvested >= minInv);
    }

    // Max invested filter
    if (filterMaxInvested) {
      const maxInv = parseFloat(filterMaxInvested);
      filtered = filtered.filter((inv) => inv.totalAmountInvested <= maxInv);
    }

    // Min return filter
    if (filterMinReturn) {
      const minRet = parseFloat(filterMinReturn);
      filtered = filtered.filter((inv) => calculateReturn(inv) >= minRet);
    }

    return filtered;
  };

  // FETCH INVESTMENTS WITH PAGINATION
  useEffect(() => {
    if (!userId) return;

    const fetchInvestments = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${url}/kamakfund/rest/kamak/customer/${userId}/real-estate-investments?page=${currentPage}&pageSize=${pageSize}`,
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
          setPagination(data.pagination);
          
          // Calculate total stats for the page
          const totalInv = data.data.reduce((sum, inv) => sum + inv.totalAmountInvested, 0);
          const totalCurr = data.data.reduce((sum, inv) => sum + inv.currentValue, 0);
          const gainLoss = totalCurr - totalInv;
          const overallRet = totalInv > 0 ? ((totalCurr - totalInv) / totalInv) * 100 : 0;

          setTotalStats({
            totalInvestments: data.pagination.totalRecords,
            totalInvested: totalInv,
            totalCurrentValue: totalCurr,
            totalGainLoss: gainLoss,
            overallReturn: overallRet
          });
        } else {
          setError(data.message || "Failed to fetch real estate investments");
        }
      } catch (err) {
        console.error("Error fetching real estate investments:", err);
        setError("Error fetching real estate investments");
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, [userId, url, currentPage, pageSize]);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterMinValue("");
    setFilterMaxValue("");
    setFilterMinInvested("");
    setFilterMaxInvested("");
    setFilterMinReturn("");
  };

  const hasActiveFilters = 
    searchTerm !== "" || 
    filterStatus !== "all" || 
    filterMinValue !== "" || 
    filterMaxValue !== "" || 
    filterMinInvested !== "" || 
    filterMaxInvested !== "" ||
    filterMinReturn !== "";

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
    if (!status) return "bg-gray-100 text-gray-700";
    const statusLower = status.toLowerCase();
    if (statusLower === "active") return "bg-emerald-100 text-emerald-700";
    if (statusLower === "inactive" || statusLower === "closed") return "bg-gray-100 text-gray-700";
    if (statusLower === "pending") return "bg-yellow-100 text-yellow-700";
    if (statusLower === "completed") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  const getReturnBadgeClass = (returnPct: number): string => {
    if (returnPct > 0) return "text-emerald-600";
    if (returnPct < 0) return "text-red-600";
    return "text-gray-600";
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Get page numbers for pagination
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const totalPages = pagination.totalPages;
    const current = pagination.currentPage;

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-sm">Loading real estate investments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded p-6 max-w-md">
          <h3 className="text-red-600 text-lg font-medium mb-2">Error</h3>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Apply client-side filters
  const filteredInvestments = applyClientFilters(investments);

  // Get unique values for filter dropdowns
  const uniqueStatuses = Array.from(new Set(investments.map(inv => inv.status).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-semibold text-gray-900">
              Real Estate Investments
            </h1>
          </div>
          <p className="text-gray-500 text-sm">Property and real estate portfolio overview</p>
        </div>

        

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-white relative overflow-hidden border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
            <InvestmentSummaryDesign />
            <div className=" mb-1">
              <div className="bg-red-50 w-fit p-2 rounded-lg mb-1">
                <PieChart className="w-5 h-5 text-stone-700" />
              </div>
              <p className="text-xs text-red-500 uppercase tracking-wider font-semibold">
                Total Investments
              </p>
              
            </div>
            <p className="text-xl font-semibold text-gray-900">{totalStats.totalInvestments}</p>
          </div>

          <div className="bg-white relative overflow-hidden border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
            <InvestmentSummaryDesign />
            <div className=" mb-1">
              <div className="bg-red-50 w-fit p-2 mb-1 rounded-lg">
                <Wallet className="w-5 h-5 text-stone-700" />
              </div>
              <p className="text-xs text-red-500 uppercase tracking-wider font-semibold">
                Page Total Invested
              </p>
              
            </div>
            <p className="text-xl font-semibold text-gray-900">
              {formatCurrency(totalStats.totalInvested)}
            </p>
          </div>

          <div className="bg-white relative overflow-hidden border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
            <InvestmentSummaryDesign />
            <div className=" mb-3">
               <div className="bg-red-50 w-fit p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-stone-700" />
              </div>
              <p className="text-xs text-red-500 uppercase tracking-wider font-semibold">
                Page Current Value
              </p>
             
            </div>
            <p className="text-xl font-semibold text-gray-900">
              {formatCurrency(totalStats.totalCurrentValue)}
            </p>
          </div>

          <div className="bg-white relative overflow-hidden border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
            <InvestmentSummaryDesign />
            <div className=" mb-3">
              <div className={`p-2 rounded-lg w-fit mb-1 ${
                totalStats.overallReturn > 0 
                  ? "bg-emerald-100" 
                  : totalStats.overallReturn < 0 
                  ? "bg-red-100" 
                  : "bg-gray-100"
              }`}>
                {totalStats.overallReturn > 0 ? (
                  <TrendingUp className="w-5 h-5 text-red-600" />
                ) : totalStats.overallReturn < 0 ? (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                ) : (
                  <DollarSign className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <p className="text-xs text-red-500 uppercase tracking-wider font-semibold">
                Page Gain/Loss
              </p>
              
            </div>
            <p className={`text-xl font-semibold ${getReturnBadgeClass(totalStats.overallReturn)}`}>
              {formatCurrency(totalStats.totalGainLoss)}
            </p>
            <p className={`text-xs mt-1 font-medium ${getReturnBadgeClass(totalStats.overallReturn)}`}>
              {totalStats.overallReturn > 0 ? "+" : ""}{totalStats.overallReturn.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by description or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-white text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {[searchTerm, filterStatus !== "all", filterMinValue, filterMaxValue, filterMinInvested, filterMaxInvested, filterMinReturn].filter(Boolean).length}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="all">All Statuses</option>
                    {uniqueStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Min Current Value (GHS)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filterMinValue}
                    onChange={(e) => setFilterMinValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Max Current Value (GHS)
                  </label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={filterMaxValue}
                    onChange={(e) => setFilterMaxValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Min Amount Invested (GHS)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filterMinInvested}
                    onChange={(e) => setFilterMinInvested(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Max Amount Invested (GHS)
                  </label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={filterMaxInvested}
                    onChange={(e) => setFilterMaxInvested(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Min Return (%)
                  </label>
                  <input
                    type="number"
                    placeholder="-100"
                    value={filterMinReturn}
                    onChange={(e) => setFilterMinReturn(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count and Page Size Selector */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing {filteredInvestments.length} of {pagination.totalRecords} investments
            {hasActiveFilters && " (filtered)"}
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows per page:</label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Investments Table */}
        {filteredInvestments.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No investments found</h3>
            <p className="text-gray-500 text-sm mb-4">
              Try adjusting your filters or search criteria
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Invested
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Value
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gain/Loss
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Return
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Started
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvestments.map((investment) => {
                    const returnPct = calculateReturn(investment);
                    const gainLoss = investment.currentValue - investment.totalAmountInvested;

                    return (
                      <tr key={investment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">
                            #{investment.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-900 font-medium">
                              {investment.description || "N/A"}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Class ID: {investment.realEstateClassId} | Product ID: {investment.realEstateProductId}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-700 font-medium">
                            {formatCurrency(investment.totalAmountInvested)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-900 font-semibold">
                            {formatCurrency(investment.currentValue)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-medium ${getReturnBadgeClass(returnPct)}`}>
                            {gainLoss > 0 ? "+" : ""}{formatCurrency(gainLoss)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className={`text-sm font-semibold ${getReturnBadgeClass(returnPct)}`}>
                              {returnPct > 0 ? "+" : ""}{returnPct.toFixed(2)}%
                            </span>
                            {returnPct > 0 && (
                              <TrendingUp className="w-3 h-3 text-emerald-600" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-700">
                            {formatDate(investment.dateStarted)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                                                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${getStatusBadgeClass(investment.status)}`}>
                            {investment.status || "N/A"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Pagination Info */}
                  <div className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>

                  {/* Pagination Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 border rounded-lg transition-colors ${
                        currentPage === 1
                          ? "border-gray-200 text-gray-400 cursor-not-allowed"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, index) => (
                        <React.Fragment key={index}>
                          {page === '...' ? (
                            <span className="px-3 py-2 text-gray-500">...</span>
                          ) : (
                            <button
                              onClick={() => handlePageChange(page as number)}
                              className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? "bg-gray-900 text-white border-gray-900"
                                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className={`p-2 border rounded-lg transition-colors ${
                        currentPage === pagination.totalPages
                          ? "border-gray-200 text-gray-400 cursor-not-allowed"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-right">
          <p className="text-xs text-gray-400">
            Last updated{" "}
            {new Date().toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default RealEstateInvestments;