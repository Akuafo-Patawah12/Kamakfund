import React, { useEffect, useState } from "react";
import { Search, Filter, X, ChevronDown, TrendingUp, Briefcase, Award } from "lucide-react";

interface PrivateEquityInvestment {
  id: number;
  fundName: string;
  commitmentAmount: number;
  capitalCalled: number;
  capitalReturned: number;
  distributionsReceived: number;
  netAssetValue: number;
  dpiMultiple: number;
  tvpiMultiple: number;
  vintageYear: number;
  status: string;
  commitmentDate: string;
  navDate: string;
  customerId: number;
}

interface ApiResponse {
  status: number;
  data: PrivateEquityInvestment[];
  message?: string;
}

function PrivateEquityInvestments() {
  const [investments, setInvestments] = useState<PrivateEquityInvestment[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<PrivateEquityInvestment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterVintageYear, setFilterVintageYear] = useState<string>("all");
  const [filterMinCommitment, setFilterMinCommitment] = useState<string>("");
  const [filterMaxCommitment, setFilterMaxCommitment] = useState<string>("");
  const [filterMinCalled, setFilterMinCalled] = useState<string>("");
  const [filterMaxCalled, setFilterMaxCalled] = useState<string>("");
  const [filterMinNAV, setFilterMinNAV] = useState<string>("");
  const [filterMaxNAV, setFilterMaxNAV] = useState<string>("");
  const [filterMinTVPI, setFilterMinTVPI] = useState<string>("");
  const [filterMinDPI, setFilterMinDPI] = useState<string>("");
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
          `${url}/kamakfund/rest/kamak/customer/${userId}/private-equity-investments`,
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
          setError(data.message || "Failed to fetch private equity investments");
        }
      } catch (err) {
        console.error("Error fetching private equity investments:", err);
        setError("Error fetching private equity investments");
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, [userId, url]);

  // Calculate unrealized value
  const calculateUnrealizedValue = (investment: PrivateEquityInvestment): number => {
    return investment.netAssetValue - investment.capitalCalled + investment.capitalReturned;
  };

  // Calculate percentage called
  const calculatePercentageCalled = (investment: PrivateEquityInvestment): number => {
    if (investment.commitmentAmount === 0) return 0;
    return (investment.capitalCalled / investment.commitmentAmount) * 100;
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...investments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.fundName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.id?.toString().includes(searchTerm) ||
          inv.vintageYear?.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((inv) => inv.status?.toLowerCase() === filterStatus.toLowerCase());
    }

    // Vintage year filter
    if (filterVintageYear !== "all") {
      filtered = filtered.filter((inv) => inv.vintageYear?.toString() === filterVintageYear);
    }

    // Min commitment filter
    if (filterMinCommitment) {
      const minVal = parseFloat(filterMinCommitment);
      filtered = filtered.filter((inv) => inv.commitmentAmount >= minVal);
    }

    // Max commitment filter
    if (filterMaxCommitment) {
      const maxVal = parseFloat(filterMaxCommitment);
      filtered = filtered.filter((inv) => inv.commitmentAmount <= maxVal);
    }

    // Min called filter
    if (filterMinCalled) {
      const minVal = parseFloat(filterMinCalled);
      filtered = filtered.filter((inv) => inv.capitalCalled >= minVal);
    }

    // Max called filter
    if (filterMaxCalled) {
      const maxVal = parseFloat(filterMaxCalled);
      filtered = filtered.filter((inv) => inv.capitalCalled <= maxVal);
    }

    // Min NAV filter
    if (filterMinNAV) {
      const minVal = parseFloat(filterMinNAV);
      filtered = filtered.filter((inv) => inv.netAssetValue >= minVal);
    }

    // Max NAV filter
    if (filterMaxNAV) {
      const maxVal = parseFloat(filterMaxNAV);
      filtered = filtered.filter((inv) => inv.netAssetValue <= maxVal);
    }

    // Min TVPI filter
    if (filterMinTVPI) {
      const minVal = parseFloat(filterMinTVPI);
      filtered = filtered.filter((inv) => inv.tvpiMultiple >= minVal);
    }

    // Min DPI filter
    if (filterMinDPI) {
      const minVal = parseFloat(filterMinDPI);
      filtered = filtered.filter((inv) => inv.dpiMultiple >= minVal);
    }

    setFilteredInvestments(filtered);
  }, [investments, searchTerm, filterStatus, filterVintageYear, filterMinCommitment, filterMaxCommitment, filterMinCalled, filterMaxCalled, filterMinNAV, filterMaxNAV, filterMinTVPI, filterMinDPI]);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterVintageYear("all");
    setFilterMinCommitment("");
    setFilterMaxCommitment("");
    setFilterMinCalled("");
    setFilterMaxCalled("");
    setFilterMinNAV("");
    setFilterMaxNAV("");
    setFilterMinTVPI("");
    setFilterMinDPI("");
  };

  const hasActiveFilters = 
    searchTerm !== "" || 
    filterStatus !== "all" || 
    filterVintageYear !== "all" ||
    filterMinCommitment !== "" || 
    filterMaxCommitment !== "" || 
    filterMinCalled !== "" || 
    filterMaxCalled !== "" ||
    filterMinNAV !== "" ||
    filterMaxNAV !== "" ||
    filterMinTVPI !== "" ||
    filterMinDPI !== "";

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatMultiple = (multiple: number): string => {
    return `${(multiple || 0).toFixed(2)}x`;
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
    if (statusLower === "inactive" || statusLower === "closed" || statusLower === "exited") return "bg-gray-100 text-gray-700";
    if (statusLower === "pending" || statusLower === "committed") return "bg-yellow-100 text-yellow-700";
    if (statusLower === "invested" || statusLower === "deployed") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  const getMultipleBadgeClass = (multiple: number): string => {
    if (multiple >= 2.0) return "text-emerald-600";
    if (multiple >= 1.0) return "text-blue-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-sm">Loading private equity investments...</p>
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

  const totalCommitment = filteredInvestments.reduce((sum, inv) => sum + inv.commitmentAmount, 0);
  const totalCalled = filteredInvestments.reduce((sum, inv) => sum + inv.capitalCalled, 0);
  const totalReturned = filteredInvestments.reduce((sum, inv) => sum + inv.capitalReturned, 0);
  const totalDistributions = filteredInvestments.reduce((sum, inv) => sum + inv.distributionsReceived, 0);
  const totalNAV = filteredInvestments.reduce((sum, inv) => sum + inv.netAssetValue, 0);
  const averageTVPI = filteredInvestments.length > 0 
    ? filteredInvestments.reduce((sum, inv) => sum + inv.tvpiMultiple, 0) / filteredInvestments.length 
    : 0;
  const averageDPI = filteredInvestments.length > 0 
    ? filteredInvestments.reduce((sum, inv) => sum + inv.dpiMultiple, 0) / filteredInvestments.length 
    : 0;
  const activeInvestments = filteredInvestments.filter(inv => inv.status?.toLowerCase() === "active").length;

  // Get unique values for filter dropdowns
  const uniqueStatuses = Array.from(new Set(investments.map(inv => inv.status).filter(Boolean)));
  const uniqueVintageYears = Array.from(new Set(investments.map(inv => inv.vintageYear).filter(Boolean))).sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-semibold text-gray-900">
              Private Equity Investments
            </h1>
          </div>
          <p className="text-gray-500 text-sm">Fund commitments and venture capital portfolio</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by fund name, ID, or vintage year..."
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
                  {[searchTerm, filterStatus !== "all", filterVintageYear !== "all", filterMinCommitment, filterMaxCommitment, filterMinCalled, filterMaxCalled, filterMinNAV, filterMaxNAV, filterMinTVPI, filterMinDPI].filter(Boolean).length}
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
                    Status
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
                    Vintage Year
                  </label>
                  <select
                    value={filterVintageYear}
                    onChange={(e) => setFilterVintageYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="all">All Years</option>
                    {uniqueVintageYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Min Commitment (GHS)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filterMinCommitment}
                    onChange={(e) => setFilterMinCommitment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Max Commitment (GHS)
                  </label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={filterMaxCommitment}
                    onChange={(e) => setFilterMaxCommitment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Min Capital Called (GHS)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filterMinCalled}
                    onChange={(e) => setFilterMinCalled(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Max Capital Called (GHS)
                  </label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={filterMaxCalled}
                    onChange={(e) => setFilterMaxCalled(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Min NAV (GHS)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filterMinNAV}
                    onChange={(e) => setFilterMinNAV(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Max NAV (GHS)
                  </label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={filterMaxNAV}
                    onChange={(e) => setFilterMaxNAV(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Min TVPI Multiple
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={filterMinTVPI}
                    onChange={(e) => setFilterMinTVPI(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Min DPI Multiple
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={filterMinDPI}
                    onChange={(e) => setFilterMinDPI(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Active Funds
            </p>
            <p className="text-2xl font-semibold text-gray-900">{activeInvestments}</p>
            <p className="text-xs text-gray-500 mt-1">
              of {filteredInvestments.length} total
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Total Commitment
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(totalCommitment)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Called: {formatCurrency(totalCalled)}
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Net Asset Value
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(totalNAV)}
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Avg TVPI
            </p>
            <p className={`text-2xl font-semibold ${getMultipleBadgeClass(averageTVPI)}`}>
              {formatMultiple(averageTVPI)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Total Value / Paid In
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Avg DPI
            </p>
            <p className={`text-2xl font-semibold ${getMultipleBadgeClass(averageDPI)}`}>
              {formatMultiple(averageDPI)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Distributions / Paid In
            </p>
          </div>
        </div>

        {/* Investments Table */}
        {filteredInvestments.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
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
                      Fund Name
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vintage
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commitment
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Called
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NAV
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distributions
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TVPI
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DPI
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvestments.map((investment) => {
                    const percentageCalled = calculatePercentageCalled(investment);

                    return (
                      <tr key={investment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-900 font-medium">
                              {investment.fundName || "N/A"}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              ID: {investment.id}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Committed: {formatDate(investment.commitmentDate)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-medium text-gray-700">
                            {investment.vintageYear || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-900 font-semibold">
                            {formatCurrency(investment.commitmentAmount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm text-gray-700 font-medium">
                              {formatCurrency(investment.capitalCalled)}
                            </span>
                            <span className="text-xs text-gray-400 mt-0.5">
                              {percentageCalled.toFixed(1)}% of commitment
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm text-gray-900 font-semibold">
                              {formatCurrency(investment.netAssetValue)}
                            </span>
                            <span className="text-xs text-gray-400 mt-0.5">
                              as of {formatDate(investment.navDate)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-medium text-emerald-600">
                              {formatCurrency(investment.distributionsReceived)}
                            </span>
                            <span className="text-xs text-gray-400 mt-0.5">
                              Returned: {formatCurrency(investment.capitalReturned)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className={`text-sm font-semibold ${getMultipleBadgeClass(investment.tvpiMultiple)}`}>
                              {formatMultiple(investment.tvpiMultiple)}
                            </span>
                            {investment.tvpiMultiple >= 2.0 && (
                              <Award className="w-3 h-3 text-emerald-600" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className={`text-sm font-semibold ${getMultipleBadgeClass(investment.dpiMultiple)}`}>
                              {formatMultiple(investment.dpiMultiple)}
                            </span>
                            {investment.dpiMultiple >= 1.0 && (
                              <TrendingUp className="w-3 h-3 text-emerald-600" />
                            )}
                          </div>
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

export default PrivateEquityInvestments;