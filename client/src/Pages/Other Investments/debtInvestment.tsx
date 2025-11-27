import React, { useEffect, useState } from "react";
import { Search, Filter, X, ChevronDown, Wallet, TrendingUp, Calendar } from "lucide-react";

interface DebtInvestment {
  id: number;
  amountInvested: number;
  principalAmount: number;
  interestRate: number;
  interestRateAmount: number;
  maturityDate: string;
  tradeDate: string;
  totalOutstanding: number;
  customerId: number;
}

interface ApiResponse {
  status: number;
  data: DebtInvestment[];
  message?: string;
}

function DebtInvestments() {
  const [investments, setInvestments] = useState<DebtInvestment[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<DebtInvestment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Filter states
  const [filterMinInvested, setFilterMinInvested] = useState<string>("");
  const [filterMaxInvested, setFilterMaxInvested] = useState<string>("");
  const [filterMinInterestRate, setFilterMinInterestRate] = useState<string>("");
  const [filterMaxInterestRate, setFilterMaxInterestRate] = useState<string>("");
  const [filterMinOutstanding, setFilterMinOutstanding] = useState<string>("");
  const [filterMaxOutstanding, setFilterMaxOutstanding] = useState<string>("");
  const [filterMaturityYear, setFilterMaturityYear] = useState<string>("all");
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
          `${url}/kamakfund/rest/kamak/customer/${userId}/debt-investments`,
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
            console.log(data)
          setInvestments(data.data);
          setFilteredInvestments(data.data);
        } else {
          setError(data.message || "Failed to fetch debt investments");
        }
      } catch (err) {
        console.error("Error fetching debt investments:", err);
        setError("Error fetching debt investments");
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

  // Check if investment is mature
  const isMatured = (maturityDate: string): boolean => {
    return calculateDaysToMaturity(maturityDate) <= 0;
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...investments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.id?.toString().includes(searchTerm) ||
          inv.principalAmount?.toString().includes(searchTerm)
      );
    }

    // Min invested filter
    if (filterMinInvested) {
      const minInv = parseFloat(filterMinInvested);
      filtered = filtered.filter((inv) => inv.amountInvested >= minInv);
    }

    // Max invested filter
    if (filterMaxInvested) {
      const maxInv = parseFloat(filterMaxInvested);
      filtered = filtered.filter((inv) => inv.amountInvested <= maxInv);
    }

    // Min interest rate filter
    if (filterMinInterestRate) {
      const minRate = parseFloat(filterMinInterestRate);
      filtered = filtered.filter((inv) => inv.interestRate >= minRate);
    }

    // Max interest rate filter
    if (filterMaxInterestRate) {
      const maxRate = parseFloat(filterMaxInterestRate);
      filtered = filtered.filter((inv) => inv.interestRate <= maxRate);
    }

    // Min outstanding filter
    if (filterMinOutstanding) {
      const minOut = parseFloat(filterMinOutstanding);
      filtered = filtered.filter((inv) => inv.totalOutstanding >= minOut);
    }

    // Max outstanding filter
    if (filterMaxOutstanding) {
      const maxOut = parseFloat(filterMaxOutstanding);
      filtered = filtered.filter((inv) => inv.totalOutstanding <= maxOut);
    }

    // Maturity year filter
    if (filterMaturityYear !== "all") {
      filtered = filtered.filter((inv) => {
        if (!inv.maturityDate) return false;
        const year = new Date(inv.maturityDate).getFullYear().toString();
        return year === filterMaturityYear;
      });
    }

    setFilteredInvestments(filtered);
  }, [investments, searchTerm, filterMinInvested, filterMaxInvested, filterMinInterestRate, filterMaxInterestRate, filterMinOutstanding, filterMaxOutstanding, filterMaturityYear]);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterMinInvested("");
    setFilterMaxInvested("");
    setFilterMinInterestRate("");
    setFilterMaxInterestRate("");
    setFilterMinOutstanding("");
    setFilterMaxOutstanding("");
    setFilterMaturityYear("all");
  };

  const hasActiveFilters = 
    searchTerm !== "" || 
    filterMinInvested !== "" || 
    filterMaxInvested !== "" || 
    filterMinInterestRate !== "" || 
    filterMaxInterestRate !== "" ||
    filterMinOutstanding !== "" ||
    filterMaxOutstanding !== "" ||
    filterMaturityYear !== "all";

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

  const getMaturityBadgeClass = (maturityDate: string): string => {
    const daysToMaturity = calculateDaysToMaturity(maturityDate);
    if (daysToMaturity <= 0) return "bg-gray-100 text-gray-700";
    if (daysToMaturity <= 30) return "bg-red-100 text-red-700";
    if (daysToMaturity <= 90) return "bg-yellow-100 text-yellow-700";
    return "bg-emerald-100 text-emerald-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-sm">Loading debt investments...</p>
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
  const totalOutstanding = filteredInvestments.reduce((sum, inv) => sum + inv.totalOutstanding, 0);
  const totalInterestEarned = filteredInvestments.reduce((sum, inv) => sum + inv.interestRateAmount, 0);
  const averageInterestRate = filteredInvestments.length > 0 
    ? filteredInvestments.reduce((sum, inv) => sum + inv.interestRate, 0) / filteredInvestments.length 
    : 0;
  const maturedInvestments = filteredInvestments.filter(inv => isMatured(inv.maturityDate)).length;
  const totalInvestments = filteredInvestments.length;

  // Get unique maturity years for filter dropdown
  const uniqueYears = Array.from(new Set(
    investments
      .map(inv => inv.maturityDate ? new Date(inv.maturityDate).getFullYear() : null)
      .filter(Boolean)
  )).sort();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-semibold text-gray-900">
              Debt Investments
            </h1>
          </div>
          <p className="text-gray-500 text-sm">Fixed income and debt securities portfolio</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by ID or principal amount..."
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
                  {[searchTerm, filterMinInvested, filterMaxInvested, filterMinInterestRate, filterMaxInterestRate, filterMinOutstanding, filterMaxOutstanding, filterMaturityYear !== "all"].filter(Boolean).length}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Min Amount Invested (GHS)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filterMinInvested}
                    onChange={(e) => setFilterMinInvested(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Min Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
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
                    placeholder="No limit"
                    value={filterMaxInterestRate}
                    onChange={(e) => setFilterMaxInterestRate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Min Outstanding (GHS)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filterMinOutstanding}
                    onChange={(e) => setFilterMinOutstanding(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Max Outstanding (GHS)
                  </label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={filterMaxOutstanding}
                    onChange={(e) => setFilterMaxOutstanding(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Maturity Year
                  </label>
                  <select
                    value={filterMaturityYear}
                    onChange={(e) => setFilterMaturityYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
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
              {maturedInvestments} matured
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Total Invested
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(totalInvested)}
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Total Outstanding
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(totalOutstanding)}
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Total Interest Earned
            </p>
            <p className="text-2xl font-semibold text-emerald-600">
              {formatCurrency(totalInterestEarned)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Avg rate: {averageInterestRate.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Investments Table */}
        {filteredInvestments.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 text-center">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
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
                      ID
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Invested
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Principal
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interest Rate
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interest Earned
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outstanding
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trade Date
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
                    const daysToMaturity = calculateDaysToMaturity(investment.maturityDate);
                    const mature = isMatured(investment.maturityDate);

                    return (
                      <tr key={investment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">
                            #{investment.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-700 font-medium">
                            {formatCurrency(investment.amountInvested)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-900 font-semibold">
                            {formatCurrency(investment.principalAmount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-sm font-semibold text-gray-900">
                              {investment.interestRate}
                            </span>
                            <TrendingUp className="w-3 h-3 text-emerald-600" />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-medium text-emerald-600">
                            {formatCurrency(investment.interestRateAmount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-700 font-medium">
                            {formatCurrency(investment.totalOutstanding)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-700">
                            {formatDate(investment.tradeDate)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm text-gray-700">
                              {formatDate(investment.maturityDate)}
                            </span>
                            {!mature && daysToMaturity > 0 && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {daysToMaturity} days
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getMaturityBadgeClass(investment.maturityDate)}`}>
                            {mature ? "Matured" : daysToMaturity <= 30 ? "Maturing Soon" : "Active"}
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

export default DebtInvestments;