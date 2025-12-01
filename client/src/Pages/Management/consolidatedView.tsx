import React, { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Briefcase, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface Investment {
  principal: number;
  totalInvestments: number;
  faceValue: number;
  name: string;
  currentValue: number;
  link: string;
}

interface InvestmentSummary {
  totalCurrentValue: number;
  totalPrincipal: number;
  totalFaceValue: number;
  totalInvestments: number;
}

interface ApiResponse {
  status: number;
  data: {
    investments: Investment[];
    totals: InvestmentSummary;
  };
  message?: string;
}

function ConsolidatedView() {
  const [summary, setSummary] = useState<InvestmentSummary | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const navigate = useNavigate();

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
        console.log("Fetched investment summary data:", data);

        if (data.status === 1) {
          setSummary(data.data.totals);
          setInvestments(data.data.investments);
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

  // Prepare data for charts
  const pieChartData = investments.map((inv) => ({
    name: inv.name,
    value: inv.currentValue,
    principal: inv.principal,
    return: inv.currentValue - inv.principal,
    returnPercentage: inv.principal > 0 ? ((inv.currentValue - inv.principal) / inv.principal) * 100 : 0
  }));

  const barChartData = investments.map((inv) => ({
    name: inv.name.length > 15 ? inv.name.substring(0, 15) + '...' : inv.name,
    Principal: inv.principal,
    "Current Value": inv.currentValue,
    Return: inv.currentValue - inv.principal
  }));

  const COLORS = ['#1f2937', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded">
          <p className="font-semibold text-gray-900 mb-1">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">Current Value: {formatCurrency(payload[0].value)}</p>
          {payload[0].payload.principal && (
            <>
              <p className="text-sm text-gray-600">Principal: {formatCurrency(payload[0].payload.principal)}</p>
              <p className={`text-sm font-semibold ${payload[0].payload.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Return: {formatCurrency(payload[0].payload.return)} ({payload[0].payload.returnPercentage.toFixed(2)}%)
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
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
      <div className="max-w-6xl mx-auto px-4 py-8">
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
                  Total Current Value
                </p>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {formatCurrency(summary.totalCurrentValue)}
              </p>
              <div className={`flex items-center gap-2 ${profit ? 'text-green-600' : 'text-red-600'}`}>
                {profit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                <span className="text-lg font-semibold">
                  {formatCurrency(Math.abs(gainLoss))} ({gainLossPercentage.toFixed(2)}%)
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
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {formatCurrency(summary.totalPrincipal)}
              </p>
              <p className="text-sm text-gray-600">
                Initial capital deployed across all investment types
              </p>
            </div>
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                    For all investments
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900">
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
            <p className="text-xl lg:text-2xl font-bold text-gray-900">
              {formatNumber(summary.totalInvestments)}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Positions across all asset classes
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart - Portfolio Distribution */}
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Distribution</h2>
            <p className="text-xs text-gray-500 mb-6">Current value by investment type</p>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name.substring(0, 12)}... ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Returns Comparison */}
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Returns Analysis</h2>
            <p className="text-xs text-gray-500 mb-6">Principal vs Current Value comparison</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Bar dataKey="Principal" fill="#94a3b8" />
                <Bar dataKey="Current Value" fill="#3b82f6" />
                <Bar dataKey="Return" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Investment Breakdown Table */}
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Investment Breakdown</h2>
            <p className="text-xs text-gray-500 mt-1">Detailed view of all investment accounts</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investment Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Principal
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Face Value
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Holdings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {investments.map((investment, index) => {
                  const invReturn = investment.currentValue - investment.principal;
                  const invReturnPct = investment.principal > 0 ? (invReturn / investment.principal) * 100 : 0;
                  const isPositive = invReturn >= 0;
                  
                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(investment.link)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{investment.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-600">
                          {formatCurrency(investment.principal)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(investment.currentValue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{formatCurrency(invReturn)}
                          <div className="text-xs">({invReturnPct.toFixed(2)}%)</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-600">
                          {formatCurrency(investment.faceValue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-600">
                          {formatNumber(investment.totalInvestments)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {/* Total Row */}
                <tr className="bg-gray-100 font-semibold">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">TOTAL</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(summary.totalPrincipal)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(summary.totalCurrentValue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-sm font-bold ${profit ? 'text-green-600' : 'text-red-600'}`}>
                      {profit ? '+' : ''}{formatCurrency(gainLoss)}
                      <div className="text-xs">({gainLossPercentage.toFixed(2)}%)</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(summary.totalFaceValue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {formatNumber(summary.totalInvestments)}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConsolidatedView;