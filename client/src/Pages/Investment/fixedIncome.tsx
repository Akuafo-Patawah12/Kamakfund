import React, { useEffect, useState } from "react";

interface MoneyMarketInvestment {
  id: number;
  investmentDate: string;
  maturityDate: string | null;
  prinipal: number; // Note: backend has typo "prinipal" instead of "principal"
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
}

const FixedIncome: React.FC = () => {
  const [investments, setInvestments] = useState<MoneyMarketInvestment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const url = import.meta.env.VITE_BASE_URL


  const [userId, setUserId] = useState<string>("");
  
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

  const fetchInvestments = async () => {
    
    
    try {
      const res = await fetch(
        `${url}/kamakfund/rest/kamak/customer/${userId}/money-market-investments`,
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
      } else {
        setError(data.message || "Failed to fetch investments");
      }
    } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError("An unexpected error occurred");
  }
}
 finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchInvestments();
  }, [userId]);


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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-sm">Loading money market investments...</p>
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

  const totalPrincipal = investments.reduce((sum, inv) => sum + (inv.prinipal || 0), 0);
  const totalValue = investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
  const avgInterestRate = investments.length > 0 
    ? (investments.reduce((sum, inv) => sum + (inv.interestRate || 0), 0) / investments.length).toFixed(2) 
    : "0.00";
  const totalGains = totalValue - totalPrincipal;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">Fixed Income Investments</h1>
          <p className="text-gray-500 text-sm">Short-term fixed income securities</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Investments</p>
            <p className="text-2xl font-semibold text-gray-900">{investments.length}</p>
          </div>

          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Principal</p>
            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalPrincipal)}</p>
          </div>

          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Current Value</p>
            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalValue)}</p>
            <p className={`text-xs mt-1 ${totalGains >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {totalGains >= 0 ? '+' : ''}{formatCurrency(totalGains)}
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Avg. Interest Rate</p>
            <p className="text-2xl font-semibold text-gray-900">{avgInterestRate}%</p>
          </div>
        </div>

        {/* Investments Table */}
        <div className="bg-white border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Security Name</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Interest Amount</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Face Value</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Interest Rate</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tenor (Days)</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Investment Date</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Maturity Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {investments.map((inv) => {
                  const gains = inv.currentValue - inv.prinipal;
                  const returnPercent = inv.prinipal > 0 ? ((gains / inv.prinipal) * 100).toFixed(2) : "0.00";
                  const daysToMaturity = calculateDaysToMaturity(inv.maturityDate);
                  
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{inv.security || `Investment #${inv.id}`}</p>
                          {daysToMaturity !== null && daysToMaturity > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {daysToMaturity} days to maturity
                            </p>
                          )}
                          {daysToMaturity !== null && daysToMaturity <= 0 && (
                            <p className="text-xs text-amber-600 mt-0.5">Matured</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-700">{formatCurrency(inv.prinipal)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-700">{formatCurrency(inv.interestAmount)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-700">{formatCurrency(inv.faceValue)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-right">
                          <span className="text-sm text-gray-900 font-medium">{formatCurrency(inv.currentValue)}</span>
                          <p className={`text-xs mt-0.5 ${parseFloat(returnPercent) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {parseFloat(returnPercent) >= 0 ? '+' : ''}{returnPercent}%
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-700 font-mono">{inv.interestRate}%</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-700">{inv.tenorInDays}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600 font-mono">
                        {formatDate(inv.investmentDate)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600 font-mono">
                        {inv.maturityDate ? formatDate(inv.maturityDate) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-right">
          <p className="text-xs text-gray-400">
            Last updated {new Date().toLocaleString('en-US', { 
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