import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Wallet, Activity, Sun, Moon } from 'lucide-react';

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
  }, []);
  // Sample data - replace with actual data from your database
  const [accounts] = useState([
    {
      account_id: 1,
      account_name: "Growth Portfolio",
      account_type: "Investment",
      account_status: "Active",
      current_balance: 125000,
      available_balance: 120000,
      credit_interest_rate: 5.5,
      total_credit_interest: 6875,
      currency_code: "USD",
      date_created: "2023-01-15"
    },
    {
      account_id: 2,
      account_name: "Retirement Fund",
      account_type: "Savings",
      account_status: "Active",
      current_balance: 85000,
      available_balance: 85000,
      credit_interest_rate: 4.2,
      total_credit_interest: 3570,
      currency_code: "USD",
      date_created: "2022-06-20"
    },
    {
      account_id: 3,
      account_name: "Emergency Fund",
      account_type: "Savings",
      account_status: "Active",
      current_balance: 45000,
      available_balance: 45000,
      credit_interest_rate: 3.8,
      total_credit_interest: 1710,
      currency_code: "USD",
      date_created: "2023-03-10"
    },
    {
      account_id: 4,
      account_name: "Tech Stocks",
      account_type: "Investment",
      account_status: "Active",
      current_balance: 68000,
      available_balance: 65000,
      credit_interest_rate: 6.8,
      total_credit_interest: 4624,
      currency_code: "USD",
      date_created: "2023-08-05"
    }
  ]);

  const metrics = useMemo(() => {
    const total = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);
    const available = accounts.reduce((sum, acc) => sum + acc.available_balance, 0);
    const totalInterest = accounts.reduce((sum, acc) => sum + acc.total_credit_interest, 0);
    const avgRate = accounts.reduce((sum, acc) => sum + acc.credit_interest_rate, 0) / accounts.length;
    
    return { total, available, totalInterest, avgRate };
  }, [accounts]);

  const accountTypeData = useMemo(() => {
    const typeMap = {};
    accounts.forEach(acc => {
      if (!typeMap[acc.account_type]) {
        typeMap[acc.account_type] = 0;
      }
      typeMap[acc.account_type] += acc.current_balance;
    });
    return Object.entries(typeMap).map(([name, value]) => ({ name, value }));
  }, [accounts]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const theme = {
    bg: darkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-white to-slate-50',
    card: darkMode ? 'bg-slate-800/50 backdrop-blur border-slate-700' : 'bg-white border-slate-200 shadow-lg',
    text: darkMode ? 'text-white' : 'text-slate-900',
    subtext: darkMode ? 'text-slate-400' : 'text-slate-600',
    border: darkMode ? 'border-slate-700' : 'border-slate-200',
    hover: darkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50',
    gridStroke: darkMode ? '#374151' : '#e2e8f0',
    tickFill: darkMode ? '#9ca3af' : '#64748b',
    tooltipBg: darkMode ? '#1e293b' : '#ffffff',
    tooltipBorder: darkMode ? '#475569' : '#cbd5e1',
  };

  return (
    <div className={`min-h-screen ${theme.bg} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header with Theme Toggle */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className={`text-4xl font-bold ${theme.text} mb-2`}>Investment Dashboard</h1>
            <p className={theme.subtext}>Track your portfolio performance and account metrics</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-lg border ${theme.border} ${theme.card} transition-all ${theme.hover}`}
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun className="text-amber-400" size={24} />
            ) : (
              <Moon className="text-slate-600" size={24} />
            )}
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`${theme.card} backdrop-blur rounded-xl p-6 border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Wallet className="text-blue-400" size={24} />
              </div>
              <span className="text-green-400 text-sm font-medium">+12.5%</span>
            </div>
            <p className={`${theme.subtext} text-sm mb-1`}>Total Balance</p>
            <p className={`text-2xl font-bold ${theme.text}`}>{formatCurrency(metrics.total)}</p>
          </div>

          <div className={`${theme.card} backdrop-blur rounded-xl p-6 border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <DollarSign className="text-green-400" size={24} />
              </div>
              <span className="text-green-400 text-sm font-medium">Available</span>
            </div>
            <p className={`${theme.subtext} text-sm mb-1`}>Available Balance</p>
            <p className={`text-2xl font-bold ${theme.text}`}>{formatCurrency(metrics.available)}</p>
          </div>

          <div className={`${theme.card} backdrop-blur rounded-xl p-6 border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-500/20 p-3 rounded-lg">
                <TrendingUp className="text-amber-400" size={24} />
              </div>
              <span className="text-amber-400 text-sm font-medium">{metrics.avgRate.toFixed(1)}%</span>
            </div>
            <p className={`${theme.subtext} text-sm mb-1`}>Total Interest Earned</p>
            <p className={`text-2xl font-bold ${theme.text}`}>{formatCurrency(metrics.totalInterest)}</p>
          </div>

          <div className={`${theme.card} backdrop-blur rounded-xl p-6 border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Activity className="text-purple-400" size={24} />
              </div>
              <span className={`${theme.subtext} text-sm font-medium`}>Accounts</span>
            </div>
            <p className={`${theme.subtext} text-sm mb-1`}>Active Accounts</p>
            <p className={`text-2xl font-bold ${theme.text}`}>{accounts.length}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Portfolio Distribution */}
          <div className={`${theme.card} backdrop-blur rounded-xl p-6 border`}>
            <h2 className={`text-xl font-bold ${theme.text} mb-6`}>Portfolio Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={accountTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {accountTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: theme.tooltipBg, border: `1px solid ${theme.tooltipBorder}` }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Account Balances */}
          <div className={`${theme.card} backdrop-blur rounded-xl p-6 border`}>
            <h2 className={`text-xl font-bold ${theme.text} mb-6`}>Account Balances</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={accounts}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.gridStroke} />
                <XAxis dataKey="account_name" tick={{ fill: theme.tickFill }} angle={-45} textAnchor="end" height={100} />
                <YAxis tick={{ fill: theme.tickFill }} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: theme.tooltipBg, border: `1px solid ${theme.tooltipBorder}` }}
                />
                <Bar dataKey="current_balance" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interest Rates Comparison */}
        <div className={`${theme.card} backdrop-blur rounded-xl p-6 border mb-8`}>
          <h2 className={`text-xl font-bold ${theme.text} mb-6`}>Interest Rates by Account</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={accounts}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.gridStroke} />
              <XAxis dataKey="account_name" tick={{ fill: theme.tickFill }} />
              <YAxis tick={{ fill: theme.tickFill }} />
              <Tooltip 
                formatter={(value) => `${value}%`}
                contentStyle={{ backgroundColor: theme.tooltipBg, border: `1px solid ${theme.tooltipBorder}` }}
              />
              <Legend />
              <Line type="monotone" dataKey="credit_interest_rate" stroke="#10b981" strokeWidth={2} name="Interest Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Accounts Table */}
        <div className={`${theme.card} backdrop-blur rounded-xl p-6 border`}>
          <h2 className={`text-xl font-bold ${theme.text} mb-6`}>Account Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme.border}`}>
                  <th className={`text-left py-3 px-4 ${theme.subtext} font-medium`}>Account Name</th>
                  <th className={`text-left py-3 px-4 ${theme.subtext} font-medium`}>Type</th>
                  <th className={`text-left py-3 px-4 ${theme.subtext} font-medium`}>Status</th>
                  <th className={`text-right py-3 px-4 ${theme.subtext} font-medium`}>Balance</th>
                  <th className={`text-right py-3 px-4 ${theme.subtext} font-medium`}>Interest Rate</th>
                  <th className={`text-right py-3 px-4 ${theme.subtext} font-medium`}>Interest Earned</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.account_id} className={`border-b ${theme.border} ${theme.hover} transition-colors`}>
                    <td className={`py-4 px-4 ${theme.text} font-medium`}>{account.account_name}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        {account.account_type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        {account.account_status}
                      </span>
                    </td>
                    <td className={`py-4 px-4 text-right ${theme.text} font-medium`}>
                      {formatCurrency(account.current_balance)}
                    </td>
                    <td className={`py-4 px-4 text-right ${theme.subtext}`}>
                      {account.credit_interest_rate}%
                    </td>
                    <td className="py-4 px-4 text-right text-green-400 font-medium">
                      {formatCurrency(account.total_credit_interest)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;