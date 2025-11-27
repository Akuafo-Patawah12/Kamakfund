import React, { useEffect, useState } from "react";
import { Search, Filter, X, ChevronDown, TrendingUp, DollarSign, Calendar } from "lucide-react";

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
}

interface ApiResponse {
  status: number;
  data: CommercialPaperInvestment[];
  message?: string;
}

function CommercialPaperInvestments() {
  const [investments, setInvestments] = useState<CommercialPaperInvestment[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<CommercialPaperInvestment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
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

  const url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const storedUser = localStorage.getItem("userId");

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        console.log("this is the parsed userId", parsed);

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

  // FETCH INVESTMENTS WHEN userId IS LOADED
  useEffect(() => {
    if (!userId) return;

    const fetchInvestments = async () => {
      try {
        const response = await fetch(
          `${url}/kamakfund/rest/kamak/customer/${userId}/commercial-paper-investments`,
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
          setFilteredInvestments(data.data);
        } else {
          setError(data.message || "Failed to fetch commercial paper investments");
        }
      } catch (err) {
        console.error("Error fetching commercial paper investments:", err);
        setError("Error fetching commercial paper investments");
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, [userId, url]);

  // Calculate days to maturity
  const calculateDaysToMaturity = (maturityDate: string): number => {
    if (!maturityDate) return 0;
    const today = new Date();
    const maturity = new Date(maturityDate);
    const diffTime = maturity.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get maturity status
  const getMaturityStatus = (investment: CommercialPaperInvestment): string => {
    const daysToMaturity = calculateDaysToMaturity(investment.maturityDate);
    if (daysToMaturity < 0) return "matured";
    if (daysToMaturity <= 30) return "maturing-soon";
    return "active";
  };

  // Calculate yield
  const calculateYield = (investment: CommercialPaperInvestment): number => {
    if (investment.amountInvested === 0) return 0;
    return (investment.totalInterestAccrued / investment.amountInvested) * 100;
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...investments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.id?.toString().includes(searchTerm) ||
          inv.amountInvested?.toString().includes(searchTerm)
      );
    }

    // Min investment filter
    if (filterMinInvestment) {
      const minVal = parseFloat(filterMinInvestment);
      filtered = filtered.filter((inv) => inv.amountInvested >= minVal);
    }

    // Max investment filter
    if (filterMaxInvestment) {
      const maxVal = parseFloat(filterMaxInvestment);
      filtered = filtered.filter((inv) => inv.amountInvested <= maxVal);
    }

    // Min interest rate filter
    if (filterMinInterestRate) {
      const minVal = parseFloat(filterMinInterestRate);
      filtered = filtered.filter((inv) => inv.interestRate >= minVal);
    }

    // Max interest rate filter
    if (filterMaxInterestRate) {
      const maxVal = parseFloat(filterMaxInterestRate);
      filtered = filtered.filter((inv) => inv.interestRate <= maxVal);
    }

    // Min face value filter
    if (filterMinFaceValue) {
      const minVal = parseFloat(filterMinFaceValue);
      filtered = filtered.filter((inv) => inv.faceValue >= minVal);
    }

    // Max face value filter
    if (filterMaxFaceValue) {
      const maxVal = parseFloat(filterMaxFaceValue);
      filtered = filtered.filter((inv) => inv.faceValue <= maxVal);
    }

    // Maturity status filter
    if (filterMaturityStatus !== "all") {
      filtered = filtered.filter((inv) => getMaturityStatus(inv) === filterMaturityStatus);
    }

    // Trade year filter
    if (filterTradeYear !== "all") {
      filtered = filtered.filter((inv) => {
        const tradeYear = new Date(inv.tradeDate).getFullYear().toString();
        return tradeYear === filterTradeYear;
      });
    }

    setFilteredInvestments(filtered);
  }, [investments, searchTerm, filterMinInvestment, filterMaxInvestment, filterMinInterestRate, filterMaxInterestRate, filterMinFaceValue, filterMaxFaceValue, filterMaturityStatus, filterTradeYear]);

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

  const getMaturityStatusBadgeClass = (status: string): string => {
    if (status === "matured") return "bg-gray-100 text-gray-700";
    if (status === "maturing-soon") return "bg-yellow-100 text-yellow-700";
    if (status === "active") return "bg-emerald-100 text-emerald-700";
    return "bg-gray-100 text-gray-700";
  };

  const getMaturityStatusLabel = (status: string): string => {
    if (status === "matured") return "Matured";
    if (status === "maturing-soon") return "Maturing Soon";
    if (status === "active") return "Active";
    return "Unknown";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-sm">Loading commercial paper investments...</p>
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

  const totalInvested = filteredInvestments.reduce((sum, inv) => sum + inv.amountInvested, 0);
  const totalFaceValue = filteredInvestments.reduce((sum, inv) => sum + inv.faceValue, 0);
  const totalInterestAccrued = filteredInvestments.reduce((sum, inv) => sum + inv.totalInterestAccrued, 0);
  const totalExpectedPayment = filteredInvestments.reduce((sum, inv) => sum + inv.totalPayment, 0);
  const averageInterestRate = filteredInvestments.length > 0 
    ? filteredInvestments.reduce((sum, inv) => sum + inv.interestRate, 0) / filteredInvestments.length 
    : 0;
  const totalInvestments = filteredInvestments.length;
  const maturingSoon = filteredInvestments.filter(inv => getMaturityStatus(inv) === "maturing-soon").length;

  // Get unique values for filter dropdowns
  const uniqueTradeYears = Array.from(new Set(investments.map(inv => new Date(inv.tradeDate).getFullYear()).filter(Boolean))).sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-gray-700" />
           
          </div>
          <h1 className="text-gray-500 text-lg">Short-term fixed income securities portfolio</h1>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by ID or amount..."
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
                  {[searchTerm, filterMinInvestment, filterMaxInvestment, filterMinInterestRate, filterMaxInterestRate, filterMinFaceValue, filterMaxFaceValue, filterMaturityStatus !== "all", filterTradeYear !== "all"].filter(Boolean).length}
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

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Min Investment (GHS)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filterMinInvestment}
                    onChange={(e) => setFilterMinInvestment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Max Investment (GHS)
                  </label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={filterMaxInvestment}
                    onChange={(e) => setFilterMaxInvestment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Min Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={filterMinInterestRate}
                    onChange={(e) => setFilterMinInterestRate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Max Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="No limit"
                    value={filterMaxInterestRate}
                    onChange={(e) => setFilterMaxInterestRate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Min Face Value (GHS)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filterMinFaceValue}
                    onChange={(e) => setFilterMinFaceValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Max Face Value (GHS)
                  </label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={filterMaxFaceValue}
                    onChange={(e) => setFilterMaxFaceValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Maturity Status
                  </label>
                  <select
                    value={filterMaturityStatus}
                    onChange={(e) => setFilterMaturityStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="maturing-soon">Maturing Soon (≤30 days)</option>
                    <option value="matured">Matured</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Trade Year
                  </label>
                  <select
                    value={filterTradeYear}
                    onChange={(e) => setFilterTradeYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="all">All Years</option>
                    {uniqueTradeYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredInvestments.length} of {investments.length} investments
          {hasActiveFilters && " (filtered)"}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Total Investments
            </p>
            <p className="text-2xl font-semibold text-gray-900">{totalInvestments}</p>
            <p className="text-xs text-gray-500 mt-1">
              {maturingSoon > 0 && `${maturingSoon} maturing soon`}
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Total Invested
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(totalInvested)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Face Value: {formatCurrency(totalFaceValue)}
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Interest Accrued
            </p>
            <p className="text-2xl font-semibold text-emerald-600">
              {formatCurrency(totalInterestAccrued)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Expected: {formatCurrency(totalExpectedPayment)}
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Avg Interest Rate
            </p>
            <p className="text-2xl font-semibold text-blue-600">
              {formatPercentage(averageInterestRate)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Across all investments
            </p>
          </div>
        </div>

        {/* Investments Table */}
        {filteredInvestments.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 text-center">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No investments found</h3>
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
          <div className="bg-white border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Investment ID
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Invested
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Face Value
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interest Rate
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interest Accrued
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Daily Interest
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Maturity Date
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvestments.map((investment) => {
                    const maturityStatus = getMaturityStatus(investment);
                    const daysToMaturity = calculateDaysToMaturity(investment.maturityDate);
                    const yieldPercent = calculateYield(investment);

                    return (
                      <tr key={investment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-gray-900 font-medium">
                              ID: {investment.id}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Trade: {formatDate(investment.tradeDate)}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Yield: {formatPercentage(yieldPercent)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-900 font-semibold">
                            {formatCurrency(investment.amountInvested)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-700 font-medium">
                            {formatCurrency(investment.faceValue)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-semibold text-blue-600">
                            {formatPercentage(investment.interestRate)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-medium text-emerald-600">
                              {formatCurrency(investment.totalInterestAccrued)}
                            </span>
                            <span className="text-xs text-gray-400 mt-0.5">
                              Total: {formatCurrency(investment.totalPayment)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-700">
                            {formatCurrency(investment.dailyInterest)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm text-gray-900 font-medium">
                              {formatDate(investment.maturityDate)}
                            </span>
                            <span className={`text-xs mt-0.5 ${daysToMaturity > 0 ? 'text-gray-500' : 'text-red-600'}`}>
                              {daysToMaturity > 0 ? `${daysToMaturity} days` : `${Math.abs(daysToMaturity)} days ago`}
                            </span>
                            {investment.nextPaymentDate && (
                              <span className="text-xs text-gray-400 mt-0.5">
                                Next: {formatDate(investment.nextPaymentDate)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getMaturityStatusBadgeClass(maturityStatus)}`}>
                            {getMaturityStatusLabel(maturityStatus)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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

export default CommercialPaperInvestments;