import React, { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Briefcase, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface InvestmentSummary {
  totalCurrentValue: number;
  totalPrincipal: number;
  totalFaceValue: number;
  totalInvestments: number;
}

interface ApiResponse {
  status: number;
  data: InvestmentSummary;
  message?: string;
}

function ConsolidatedView() {
  const [summary, setSummary] = useState<InvestmentSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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

  // FETCH INVESTMENT SUMMARY WHEN userId IS LOADED
  useEffect(() => {
    if (!userId) return;

    const fetchSummary = async () => {
      try {
        const response = await fetch(
          `${url}/kamakfund/rest/kamak/customer/${userId}/investment-summary`,
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
          setSummary(data.data);
        } else {
          setError(data.message || "Failed to fetch investment summary");
        }
      } catch (err) {
        console.error("Error fetching investment summary:", err);
        setError("Error fetching investment summary");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [userId, url]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num || 0);
  };

  const calculateGainLoss = (): number => {
    if (!summary) return 0;
    return summary.totalCurrentValue - summary.totalPrincipal;
  };

  const calculateGainLossPercentage = (): number => {
    if (!summary || summary.totalPrincipal === 0) return 0;
    return ((summary.totalCurrentValue - summary.totalPrincipal) / summary.totalPrincipal) * 100;
  };

  const isProfit = (): boolean => {
    return calculateGainLoss() >= 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-sm">Loading investment summary...</p>
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

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded p-6 max-w-md text-center">
          <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 text-lg font-medium mb-2">No Data Available</h3>
          <p className="text-gray-500 text-sm">Investment summary data could not be loaded.</p>
        </div>
      </div>
    );
  }

  const gainLoss = calculateGainLoss();
  const gainLossPercentage = calculateGainLossPercentage();
  const profit = isProfit();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <PieChart className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-semibold text-gray-900">
              Investment Portfolio Summary
            </h1>
          </div>
          <p className="text-gray-500 text-sm">Comprehensive overview of all your investments</p>
        </div>

        {/* Main Stats - Hero Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Total Current Value Card */}
          <div className="bg-white border border-gray-200 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-900 rounded-full -mr-16 -mt-16 opacity-5"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-gray-500" />
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Total Portfolio Value
                </p>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-4">
                {formatCurrency(summary.totalCurrentValue)}
              </p>
              <div className="flex items-center gap-2">
                {profit ? (
                  <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                )}
                <span className={`text-lg font-semibold ${profit ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(gainLoss))}
                </span>
                <span className={`text-sm ${profit ? 'text-emerald-600' : 'text-red-600'}`}>
                  ({profit ? '+' : ''}{gainLossPercentage.toFixed(2)}%)
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {profit ? 'Total gain' : 'Total loss'} from principal
              </p>
            </div>
          </div>

          {/* Total Principal Card */}
          <div className="bg-white border border-gray-200 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full -mr-16 -mt-16 opacity-5"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-gray-500" />
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Total Principal Invested
                </p>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-4">
                {formatCurrency(summary.totalPrincipal)}
              </p>
              <p className="text-sm text-gray-600">
                Initial capital deployed across all investment types
              </p>
            </div>
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Face Value Card */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    Total Face Value
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Bonds & Commercial Paper
                  </p>
                </div>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.totalFaceValue)}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Maturity value of fixed income securities
              </p>
            </div>
          </div>

          {/* Total Investments Count Card */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    Total Investments
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Active Holdings
                  </p>
                </div>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(summary.totalInvestments)}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Positions across all asset classes
              </p>
            </div>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="bg-white border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance Breakdown</h2>
          
          <div className="space-y-4">
            {/* Current Value vs Principal */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Current Value vs Principal</span>
                <span className="text-sm font-medium text-gray-900">
                  {((summary.totalCurrentValue / summary.totalPrincipal) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${profit ? 'bg-emerald-600' : 'bg-red-600'}`}
                  style={{
                    width: `${Math.min(((summary.totalCurrentValue / summary.totalPrincipal) * 100), 100)}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Face Value Coverage */}
            {summary.totalFaceValue > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Face Value Coverage</span>
                  <span className="text-sm font-medium text-gray-900">
                    {((summary.totalFaceValue / summary.totalPrincipal) * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full"
                    style={{
                      width: `${Math.min(((summary.totalFaceValue / summary.totalPrincipal) * 100), 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Average Value per Investment */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Avg Value per Investment</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(summary.totalCurrentValue / summary.totalInvestments)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Summary Table */}
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Detailed Metrics</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metric
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % of Principal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    Total Current Value
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-semibold">
                    {formatCurrency(summary.totalCurrentValue)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className={`font-medium ${profit ? 'text-emerald-600' : 'text-red-600'}`}>
                      {((summary.totalCurrentValue / summary.totalPrincipal) * 100).toFixed(2)}%
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    Total Principal
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-semibold">
                    {formatCurrency(summary.totalPrincipal)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">
                    100.00%
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    Total Face Value
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-semibold">
                    {formatCurrency(summary.totalFaceValue)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">
                    {summary.totalPrincipal > 0 
                      ? `${((summary.totalFaceValue / summary.totalPrincipal) * 100).toFixed(2)}%`
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    Gain / Loss
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className={`font-semibold ${profit ? 'text-emerald-600' : 'text-red-600'}`}>
                      {profit ? '+' : ''}{formatCurrency(gainLoss)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className={`font-medium ${profit ? 'text-emerald-600' : 'text-red-600'}`}>
                      {profit ? '+' : ''}{gainLossPercentage.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Investment Types Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div>
              <p className="text-sm text-blue-900 font-medium mb-1">Portfolio Composition</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                This summary includes data from Money Market, Bonds, Equities, Collective Investments, 
                Real Estate, Private Equity, Commercial Paper, and Debt instruments. Values are calculated 
                based on current market valuations and reported NAV where applicable.
              </p>
            </div>
          </div>
        </div>

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

export default ConsolidatedView;