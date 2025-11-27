import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, X, ChevronDown } from "lucide-react";

interface NonFixedInvestmentProps {
  purchaseDate: string;
  securityCode: string;
  securityName: string;
  quantity: number;
  cost: number;
  currentValue: number;
  previousValuation: number;
}

interface ApiResponse {
  status: number;
  data: NonFixedInvestmentProps[];
  message?: string;
}

function NonFixedInvestments() {
  const [equities, setEquities] = useState<NonFixedInvestmentProps[]>([]);
  const [filteredEquities, setFilteredEquities] = useState<NonFixedInvestmentProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Filter states
  const [filterGainLoss, setFilterGainLoss] = useState<string>("all"); // all, gains, losses
  const [filterDateRange, setFilterDateRange] = useState<string>("all"); // all, 30days, 90days, 1year
  const [filterMinValue, setFilterMinValue] = useState<string>("");
  const [filterMaxValue, setFilterMaxValue] = useState<string>("");
  
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string>("");
  const url = import.meta.env.VITE_BASE_URL
    
    useEffect(() => {
      const storedUser = localStorage.getItem("userId");
    
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          console.log("this is the parsed userId", parsed)
    
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
    const fetchEquities = async () => {
        if (!userId) return;
      try {
        const response = await fetch(
          `${url}/kamakfund/rest/kamak/customer/${userId}/non-fixed-investments`,
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
          setEquities(data.data);
          setFilteredEquities(data.data);
          console.log("Fetched equity investments:", data.data);
        } else {
          navigate("/session-expired");
          setError(data.message || "Failed to fetch equity investments");
        }
      } catch (err) {
        navigate("/session-expired");
        console.error("Error fetching equity investments:", err);
        setError("Error fetching equity investments");
      } finally {
        setLoading(false);
      }
    };

    fetchEquities();
  }, [navigate,userId]);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    let filtered = [...equities];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (eq) =>
          eq.securityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          eq.securityCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Gain/Loss filter
    if (filterGainLoss !== "all") {
      filtered = filtered.filter((eq) => {
        const gains = eq.currentValue - eq.cost;
        return filterGainLoss === "gains" ? gains >= 0 : gains < 0;
      });
    }

    // Date range filter
    if (filterDateRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filterDateRange) {
        case "30days":
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case "90days":
          cutoffDate.setDate(now.getDate() - 90);
          break;
        case "1year":
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter((eq) => {
        const purchaseDate = new Date(eq.purchaseDate);
        return purchaseDate >= cutoffDate;
      });
    }

    // Min value filter
    if (filterMinValue) {
      const minVal = parseFloat(filterMinValue);
      filtered = filtered.filter((eq) => eq.currentValue >= minVal);
    }

    // Max value filter
    if (filterMaxValue) {
      const maxVal = parseFloat(filterMaxValue);
      filtered = filtered.filter((eq) => eq.currentValue <= maxVal);
    }

    setFilteredEquities(filtered);
  }, [equities, searchTerm, filterGainLoss, filterDateRange, filterMinValue, filterMaxValue]);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterGainLoss("all");
    setFilterDateRange("all");
    setFilterMinValue("");
    setFilterMaxValue("");
  };

  const hasActiveFilters = 
    searchTerm !== "" || 
    filterGainLoss !== "all" || 
    filterDateRange !== "all" || 
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-sm">Loading equity investments...</p>
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

  const totalCost = filteredEquities.reduce((sum, eq) => sum + (eq.cost || 0), 0);
  const totalCurrentValue = filteredEquities.reduce((sum, eq) => sum + (eq.currentValue || 0), 0);
  const totalShares = filteredEquities.reduce((sum, eq) => sum + (eq.quantity || 0), 0);
  const totalGains = totalCurrentValue - totalCost;
  const totalGainsPercent = totalCost > 0 ? ((totalGains / totalCost) * 100).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          
          <h1 className="text-gray-500 text-lg">Non-fixed income portfolio overview</h1>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col  md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1  relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by security name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle Button */}
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
                  {[searchTerm, filterGainLoss !== "all", filterDateRange !== "all", filterMinValue, filterMaxValue].filter(Boolean).length}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            {/* Reset Filters Button */}
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
                {/* Gain/Loss Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Performance
                  </label>
                  <select
                    value={filterGainLoss}
                    onChange={(e) => setFilterGainLoss(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="all">All Positions</option>
                    <option value="gains">Gains Only</option>
                    <option value="losses">Losses Only</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Purchase Date
                  </label>
                  <select
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="all">All Time</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                    <option value="1year">Last Year</option>
                  </select>
                </div>

                {/* Min Value Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Min Value ($)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filterMinValue}
                    onChange={(e) => setFilterMinValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                {/* Max Value Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Max Value ($)
                  </label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={filterMaxValue}
                    onChange={(e) => setFilterMaxValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredEquities.length} of {equities.length} positions
          {hasActiveFilters && " (filtered)"}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Investments Owned
            </p>
            <p className="text-2xl font-semibold text-gray-900">{filteredEquities.length}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Total Shares
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {totalShares.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Total Cost
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(totalCost)}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Current Value
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(totalCurrentValue)}
            </p>
            <p
              className={`text-xs mt-1 ${
                parseFloat(totalGainsPercent) >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {parseFloat(totalGainsPercent) >= 0 ? "+" : ""}
              {formatCurrency(totalGains)} ({totalGainsPercent}%)
            </p>
          </div>
        </div>

        {/* Equities Table */}
        {filteredEquities.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 text-center">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
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
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Security Name
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Price
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Previous Value
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Value
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gain/Loss
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purchase Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEquities.map((equity, index) => {
                    const gains = equity.currentValue - equity.cost;
                    const gainsPercent = equity.cost > 0 ? ((gains / equity.cost) * 100).toFixed(2) : "0.00";
                    const avgPrice = equity.quantity > 0 ? (equity.cost / equity.quantity) : 0;
                    const currentPrice = equity.quantity > 0 ? (equity.currentValue / equity.quantity) : 0;
                    const dayChange = equity.currentValue - equity.previousValuation;
                    const dayChangePercent = equity.previousValuation > 0 ? ((dayChange / equity.previousValuation) * 100).toFixed(2) : "0.00";

                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {equity.securityName}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 font-mono">
                              {equity.securityCode}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-700">
                            {equity.quantity.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-right">
                            <span className="text-sm text-gray-700">
                              {formatCurrency(equity.cost)}
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">
                              @ {formatCurrency(avgPrice)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-700 font-mono">
                            {formatCurrency(currentPrice)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-right">
                            <span className="text-sm text-gray-700">
                              {formatCurrency(equity.previousValuation)}
                            </span>
                            <p
                              className={`text-xs mt-0.5 ${
                                parseFloat(dayChangePercent) >= 0
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            >
                              {parseFloat(dayChangePercent) >= 0 ? "+" : ""}
                              {dayChangePercent}%
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-900 font-medium">
                            {formatCurrency(equity.currentValue)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-right">
                            <span
                              className={`text-sm font-medium ${
                                gains >= 0 ? "text-emerald-600" : "text-red-600"
                              }`}
                            >
                              {gains >= 0 ? "+" : ""}
                              {formatCurrency(gains)}
                            </span>
                            <p
                              className={`text-xs mt-0.5 ${
                                parseFloat(gainsPercent) >= 0
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            >
                              {parseFloat(gainsPercent) >= 0 ? "+" : ""}
                              {gainsPercent}%
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-600 font-mono">
                          {formatDate(equity.purchaseDate)}
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

export default NonFixedInvestments;