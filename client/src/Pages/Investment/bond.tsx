import { useEffect, useState } from "react";
import { Search, Filter, X, ChevronDown, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0
  });
  
  // Filter states
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
          console.log("Fetched bond investments:", data.data);
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

  // Apply filters whenever filter criteria change
  useEffect(() => {
    let filtered = [...bonds];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (bond) =>
          bond.securityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bond.id.toString().includes(searchTerm)
      );
    }

    // Performance filter
    if (filterPerformance !== "all") {
      filtered = filtered.filter((bond) => {
        const diff = bond.currentValue - bond.faceValue;
        return filterPerformance === "premium" ? diff > 0 : diff < 0;
      });
    }

    // Maturity filter
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

    // Min/Max coupon filters
    if (filterMinCoupon) {
      const minCoupon = parseFloat(filterMinCoupon);
      filtered = filtered.filter((bond) => bond.couponRate >= minCoupon);
    }

    if (filterMaxCoupon) {
      const maxCoupon = parseFloat(filterMaxCoupon);
      filtered = filtered.filter((bond) => bond.couponRate <= maxCoupon);
    }

    // Min/Max value filters
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
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const { currentPage, totalPages } = pagination;
    
    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push("...");
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("...");
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
          <p className="text-gray-600 text-sm">Loading bond investments...</p>
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

  const totalValue = filteredBonds.reduce((sum, bond) => sum + (bond.currentValue || 0), 0);
  const totalFaceValue = filteredBonds.reduce((sum, bond) => sum + (bond.faceValue || 0), 0);
  const totalNextCoupon = filteredBonds.reduce((sum, bond) => sum + (bond.nextCoupon || 0), 0);
  const totalCoupon = filteredBonds.reduce(
    (sum, bond) => sum + (bond.faceValue * (bond.couponRate / 100) * (bond.tenorInDays / 365)),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-gray-500 text-sm">Fixed income portfolio overview</h1>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by security name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-white text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {[searchTerm, filterPerformance !== "all", filterMaturity !== "all", filterMinCoupon, filterMaxCoupon, filterMinValue, filterMaxValue].filter(Boolean).length}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Performance vs Face Value
                  </label>
                  <select
                    value={filterPerformance}
                    onChange={(e) => setFilterPerformance(e.target.value)}
                    className="w-full px-3 py-2 text-stone-600 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="all">All Bonds</option>
                    <option value="premium">Trading at Premium</option>
                    <option value="discount">Trading at Discount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Maturity Period
                  </label>
                  <select
                    value={filterMaturity}
                    onChange={(e) => setFilterMaturity(e.target.value)}
                    className="w-full px-3 py-2 text-stone-600 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="all">All Maturities</option>
                    <option value="3months">Within 3 Months</option>
                    <option value="6months">Within 6 Months</option>
                    <option value="1year">Within 1 Year</option>
                    <option value="2years">Within 2 Years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Min Coupon Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={filterMinCoupon}
                    onChange={(e) => setFilterMinCoupon(e.target.value)}
                    className="w-full px-3 py-2 border text-stone-600 border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Max Coupon Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="No limit"
                    value={filterMaxCoupon}
                    onChange={(e) => setFilterMaxCoupon(e.target.value)}
                    className="w-full px-3 py-2 text-stone-600 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Min Current Value ($)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filterMinValue}
                    onChange={(e) => setFilterMinValue(e.target.value)}
                    className="w-full px-3 py-2 text-stone-600 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Max Current Value ($)
                  </label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={filterMaxValue}
                    onChange={(e) => setFilterMaxValue(e.target.value)}
                    className="w-full px-3 py-2 text-stone-600 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {filteredBonds.length} of {pagination.totalRecords} bonds
            {hasActiveFilters && " (filtered)"}
          </div>
          
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border rounded-lg border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Number of Bonds
            </p>
            <p className="text-2xl font-semibold text-gray-900">{filteredBonds.length}</p>
          </div>

          <div className="bg-white border rounded-lg border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Total Face Value
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(totalFaceValue)}
            </p>
          </div>

          <div className="bg-white border rounded-lg border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Current Value
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(totalValue)}
            </p>
            {totalFaceValue > 0 && (
              <p
                className={`text-xs mt-1 ${
                  totalValue >= totalFaceValue ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {totalValue >= totalFaceValue ? "+" : ""}
                {((totalValue - totalFaceValue) / totalFaceValue * 100).toFixed(2)}%
              </p>
            )}
          </div>

          <div className="bg-white border rounded-lg border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Total Coupon
            </p>
            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalCoupon)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Next: {formatCurrency(totalNextCoupon)}
            </p>
          </div>
        </div>

        {/* Bonds Table */}
        {filteredBonds.length === 0 ? (
          <div className="bg-white border  border-gray-200 p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bonds found</h3>
            <p className="text-gray-500 text-sm mb-4">
              Try adjusting your filters or search criteria
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white border rounded-lg border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Security Name
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Coupon Date
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Face Value
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Value
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coupon Rate
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Coupon
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenor (Days)
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trade Date
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Principal
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Maturity Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBonds.map((bond) => {
                      const valueChange = bond.faceValue > 0 
                        ? ((bond.currentValue - bond.faceValue) / bond.faceValue * 100).toFixed(2) 
                        : "0.00";
                      const daysToNextCoupon = bond.nextCouponDate 
                        ? getDaysUntil(bond.nextCouponDate) 
                        : null;
                      const daysToMaturity = getDaysUntil(bond.maturityDate);

                      return (
                        <tr key={bond.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {bond.securityName} 
                          </td>
                          <td>{bond.nextCouponDate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900"> 
                            {formatCurrency(bond.faceValue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900"> 
                            {formatCurrency(bond.currentValue)}
                            {bond.faceValue > 0 && (
                              <p  
                                className={`text-xs mt-1 ${
                                  valueChange >= "0" ? "text-emerald-600" : "text-red-600"
                                }`} >
                                {valueChange >= "0" ? "+" : ""}
                                {valueChange}%  
                              </p>
                            )}
                          </td> 
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900"> 
                            {bond.couponRate.toFixed(2)}%
                          </td> 
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900"> 
                            {formatCurrency(bond.nextCoupon)}
                            {daysToNextCoupon !== null && ( 
                              <p className="text-xs text-gray-500 mt-1">
                                in {daysToNextCoupon} days
                              </p>  
                            )}
                          </td> 
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900"> 
                            {bond.tenorInDays}
                          </td> 
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900"> 
                            {formatDate(bond.tradeDate)}
                          </td> 
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            {bond.principal}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900"> 
                            {formatDate(bond.maturityDate)}
                            <p className="text-xs text-gray-500 mt-1">
                              in {daysToMaturity} days  
                            </p>
                          </td> 
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>    
            {/* Pagination Controls */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600"> 
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 bg-white border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" /> 
                </button>
                {getPageNumbers().map((page, index) =>
                  page === "..." ? (  
                    <span key={index} className="px-2 text-gray-500">...</span>
                  ) : (
                    <button 
                      key={index}
                      onClick={() => handlePageChange(Number(page))}
                      className={`px-3 py-1 border rounded text-sm font-medium ${ 
                        page === currentPage 
                          ? "bg-gray-900 text-white border-gray-900" 
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50" 
                      }`}
                    >
                      {page}  
                    </button>
                  )
                )}  
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}  
                  className="p-2 bg-white border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />  
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