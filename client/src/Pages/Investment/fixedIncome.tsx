import React, { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Calendar, Percent, Clock, Shield, RefreshCw, X, FileText, Landmark, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from "lucide-react";

interface MoneyMarketInvestment {
  id: number;
  investmentDate: string;
  maturityDate: string | null;
  prinipal: number;
  interestAmount: number;
  currentValue: number;
  interestRate: number;
  security: string;
  faceValue: number;
  tenorInDays: number;
}

interface ApiResponse {
  status: number;
  data: MoneyMarketInvestment[];
  message?: string;
  offset: number;
  limit: number;
  count: number;
  total: number;
}

const FixedIncome: React.FC = () => {
  const [investments, setInvestments] = useState<MoneyMarketInvestment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  const url = import.meta.env.VITE_BASE_URL;
  const [userId, setUserId] = useState<string>("");
  
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

  const fetchInvestments = async (page: number = 1, limit: number = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const offset = (page - 1) * limit;
      const res = await fetch(
        `${url}/kamakfund/rest/kamak/customer/${userId}/money-market-investments?offset=${offset}&limit=${limit}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to fetch investments");
      }

      const data: ApiResponse = await res.json();
      if (data.status === 1) {
        console.log(data.data);
        setInvestments(data.data);
        setTotalItems(data.total);
        setCurrentPage(page);
      } else {
        setError(data.message || "Failed to fetch investments");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchInvestments(currentPage, itemsPerPage);
  }, [userId]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchInvestments(newPage, itemsPerPage);
    }
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    fetchInvestments(1, newLimit);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateDaysToMaturity = (maturityDate: string | null): number | null => {
    if (!maturityDate) return null;
    const today = new Date();
    const maturity = new Date(maturityDate);
    const diffTime = maturity.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
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

  const totalPrincipal = investments.reduce((sum, inv) => sum + (inv.prinipal || 0), 0);
  const totalValue = investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
  const totalInterestAmount = investments.reduce((sum, inv) => sum + (inv.interestAmount || 0), 0);
  const totalGains = totalValue - totalPrincipal;
  const averageRate = investments.length > 0 
    ? (investments.reduce((sum, inv) => sum + inv.interestRate, 0) / investments.length).toFixed(2)
    : "0.00";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Fixed Income Securities</h1>
              <p className="text-sm text-slate-600">Short-term money market investments</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">Total Investments</p>
            <p className="text-2xl font-bold text-slate-900">{totalItems}</p>
            <p className="text-xs text-slate-500 mt-2">Active securities</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">Total Principal</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalPrincipal)}</p>
            <p className="text-xs text-slate-500 mt-2">Current page</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">Current Value</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalValue)}</p>
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
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                <Percent className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">Total Interest</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalInterestAmount)}</p>
            <p className="text-xs text-slate-500 mt-2">Avg rate: {averageRate}%</p>
          </div>
        </div>

        {/* Results Count and Items Per Page */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Shield className="w-4 h-4" />
            <span>
              Showing <span className="font-semibold text-slate-900">{startItem}-{endItem}</span> of{' '}
              <span className="font-semibold text-slate-900">{totalItems}</span> securities
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="text-sm text-slate-600">
              Show:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Investments Table */}
        {investments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Landmark className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No investments found</h3>
            <p className="text-slate-600 text-sm">
              You don't have any money market investments yet
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Security Name
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Principal
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Interest Amount
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Face Value
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Current Value
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Rate
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Tenor
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Investment Date
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Maturity Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {investments.map((inv) => {
                      const gains = inv.currentValue - inv.prinipal;
                      const returnPercent = inv.prinipal > 0 ? ((gains / inv.prinipal) * 100).toFixed(2) : "0.00";
                      const daysToMaturity = calculateDaysToMaturity(inv.maturityDate);
                      
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                {inv.security || `Investment #${inv.id}`}
                              </p>
                              {daysToMaturity !== null && daysToMaturity > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <p className="text-xs text-slate-500">
                                    {daysToMaturity} days to maturity
                                  </p>
                                </div>
                              )}
                              {daysToMaturity !== null && daysToMaturity <= 0 && (
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                                  Matured
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm text-slate-900 font-medium">{formatCurrency(inv.prinipal)}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm text-slate-700 font-medium">{formatCurrency(inv.interestAmount)}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm text-slate-700">{formatCurrency(inv.faceValue)}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-right">
                              <span className="text-sm text-slate-900 font-bold">{formatCurrency(inv.currentValue)}</span>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                {parseFloat(returnPercent) >= 0 ? (
                                  <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <ArrowDownRight className="w-3 h-3 text-red-600" />
                                )}
                                <p className={`text-xs font-medium ${parseFloat(returnPercent) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {parseFloat(returnPercent) >= 0 ? '+' : ''}{returnPercent}%
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-sm font-semibold bg-slate-50 text-slate-900 rounded-full border border-slate-200 font-mono">
                              {inv.interestRate}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm text-slate-700 font-medium">{inv.tenorInDays} days</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm text-slate-700 font-medium">{formatDate(inv.investmentDate)}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm text-slate-700 font-medium">
                              {inv.maturityDate ? formatDate(inv.maturityDate) : '-'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4">
                <div className="text-sm text-slate-600">
                  Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
                  <span className="font-semibold text-slate-900">{totalPages}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm text-slate-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page as number)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Real-time data</span>
          </div>
          <p>
            Last updated{" "}
            {new Date().toLocaleString('en-US', { 
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FixedIncome;