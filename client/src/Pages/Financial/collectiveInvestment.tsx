import React, { useEffect, useState } from "react";
import { Search, Filter, X, ChevronDown, TrendingUp } from "lucide-react";

interface CollectiveInvestment {
  accountNumber: string;
  valuation: number;
  cashBalance: number;
  totalUnits: number;
  lastContributionDate: string;
  lastTransactionAmount: number;
  paymentFrequency: string;
  paymentStatus: string;
  status: string;
  refNo: string;
  lastValuationDate: string;
}

interface ApiResponse {
  status: number;
  data: CollectiveInvestment[];
  message?: string;
}

function CollectiveInvestments() {
  const [investments, setInvestments] = useState<CollectiveInvestment[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<CollectiveInvestment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all");
  const [filterPaymentFrequency, setFilterPaymentFrequency] = useState<string>("all");
  const [filterMinValuation, setFilterMinValuation] = useState<string>("");
  const [filterMaxValuation, setFilterMaxValuation] = useState<string>("");
  const [filterMinUnits, setFilterMinUnits] = useState<string>("");
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

// FETCH INVESTMENTS WHEN userId IS LOADED
useEffect(() => {
  if (!userId) return; //  Prevent empty calls

  const fetchInvestments = async () => {
    try {
      const response = await fetch(
        `${url}/kamakfund/rest/kamak/customer/${userId}/collective-investments`,
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
        setError(data.message || "Failed to fetch collective investments");
      }
    } catch (err) {
      console.error("Error fetching collective investments:", err);
      setError("Error fetching collective investments");
    } finally {
      setLoading(false);
    }
  };

  fetchInvestments();
}, [userId]); // ← IMPORTANT


  // Apply filters
  useEffect(() => {
    let filtered = [...investments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.refNo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((inv) => inv.status?.toLowerCase() === filterStatus.toLowerCase());
    }

    // Payment status filter
    if (filterPaymentStatus !== "all") {
      filtered = filtered.filter((inv) => inv.paymentStatus?.toLowerCase() === filterPaymentStatus.toLowerCase());
    }

    // Payment frequency filter
    if (filterPaymentFrequency !== "all") {
      filtered = filtered.filter((inv) => inv.paymentFrequency?.toLowerCase() === filterPaymentFrequency.toLowerCase());
    }

    // Min valuation filter
    if (filterMinValuation) {
      const minVal = parseFloat(filterMinValuation);
      filtered = filtered.filter((inv) => inv.valuation >= minVal);
    }

    // Max valuation filter
    if (filterMaxValuation) {
      const maxVal = parseFloat(filterMaxValuation);
      filtered = filtered.filter((inv) => inv.valuation <= maxVal);
    }

    // Min units filter
    if (filterMinUnits) {
      const minUnits = parseFloat(filterMinUnits);
      filtered = filtered.filter((inv) => inv.totalUnits >= minUnits);
    }

    setFilteredInvestments(filtered);
  }, [investments, searchTerm, filterStatus, filterPaymentStatus, filterPaymentFrequency, filterMinValuation, filterMaxValuation, filterMinUnits]);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterPaymentStatus("all");
    setFilterPaymentFrequency("all");
    setFilterMinValuation("");
    setFilterMaxValuation("");
    setFilterMinUnits("");
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
    if (!status) return "bg-gray-100 text-gray-700";
    const statusLower = status.toLowerCase();
    if (statusLower === "active") return "bg-emerald-100 text-emerald-700";
    if (statusLower === "inactive" || statusLower === "closed") return "bg-gray-100 text-gray-700";
    if (statusLower === "pending") return "bg-yellow-100 text-yellow-700";
    return "bg-blue-100 text-blue-700";
  };

  const getPaymentStatusBadgeClass = (status: string): string => {
    if (!status) return "bg-gray-100 text-gray-700";
    const statusLower = status.toLowerCase();
    if (statusLower === "paid" || statusLower === "current") return "bg-emerald-100 text-emerald-700";
    if (statusLower === "overdue" || statusLower === "late") return "bg-red-100 text-red-700";
    if (statusLower === "pending") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-sm">Loading collective investments...</p>
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

  const totalValuation = filteredInvestments.reduce((sum, inv) => sum + (inv.valuation || 0), 0);
  const totalCashBalance = filteredInvestments.reduce((sum, inv) => sum + (inv.cashBalance || 0), 0);
  const totalUnits = filteredInvestments.reduce((sum, inv) => sum + (inv.totalUnits || 0), 0);
  const activeAccounts = filteredInvestments.filter(inv => inv.status?.toLowerCase() === "active").length;

  // Get unique values for filter dropdowns
  const uniqueStatuses = Array.from(new Set(investments.map(inv => inv.status).filter(Boolean)));
  const uniquePaymentStatuses = Array.from(new Set(investments.map(inv => inv.paymentStatus).filter(Boolean)));
  const uniqueFrequencies = Array.from(new Set(investments.map(inv => inv.paymentFrequency).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">
            Collective Investments
          </h1>
          <p className="text-gray-500 text-sm">Unit trust and mutual fund portfolio overview</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by account number or reference..."
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
                  {[searchTerm, filterStatus !== "all", filterPaymentStatus !== "all", filterPaymentFrequency !== "all", filterMinValuation, filterMaxValuation, filterMinUnits].filter(Boolean).length}
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
                    Account Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="all">All Statuses</option>
                    {uniqueStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={filterPaymentStatus}
                    onChange={(e) => setFilterPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="all">All Payment Statuses</option>
                    {uniquePaymentStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Payment Frequency
                  </label>
                  <select
                    value={filterPaymentFrequency}
                    onChange={(e) => setFilterPaymentFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="all">All Frequencies</option>
                    {uniqueFrequencies.map(freq => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Min Valuation ($)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filterMinValuation}
                    onChange={(e) => setFilterMinValuation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Max Valuation ($)
                  </label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={filterMaxValuation}
                    onChange={(e) => setFilterMaxValuation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Min Units
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filterMinUnits}
                    onChange={(e) => setFilterMinUnits(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredInvestments.length} of {investments.length} accounts
          {hasActiveFilters && " (filtered)"}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Active Accounts
            </p>
            <p className="text-2xl font-semibold text-gray-900">{activeAccounts}</p>
            <p className="text-xs text-gray-500 mt-1">
              of {filteredInvestments.length} total
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Total Units
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {totalUnits.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Total Valuation
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(totalValuation)}
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Cash Balance
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(totalCashBalance)}
            </p>
          </div>
        </div>

        {/* Investments Table */}
        {filteredInvestments.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
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
                      Account
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valuation
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cash Balance
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Units
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Contribution
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Frequency
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvestments.map((investment, index) => {
                    const pricePerUnit = investment.totalUnits > 0 
                      ? investment.valuation / investment.totalUnits 
                      : 0;

                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {investment.accountNumber || "N/A"}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Ref: {investment.refNo || "N/A"}
                            </p>
                            {investment.lastValuationDate && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                Valued: {formatDate(investment.lastValuationDate)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-right">
                            <span className="text-sm text-gray-900 font-medium">
                              {formatCurrency(investment.valuation)}
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">
                              @ {formatCurrency(pricePerUnit)}/unit
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-700">
                            {formatCurrency(investment.cashBalance)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-700 font-mono">
                            {investment.totalUnits.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-right">
                            <span className="text-sm text-gray-700">
                              {formatCurrency(investment.lastTransactionAmount)}
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatDate(investment.lastContributionDate)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                            {investment.paymentFrequency || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getPaymentStatusBadgeClass(investment.paymentStatus)}`}>
                            {investment.paymentStatus || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusBadgeClass(investment.status)}`}>
                            {investment.status || "N/A"}
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

export default CollectiveInvestments;