import { useEffect, useState } from 'react';
import { Eye, EyeOff, ArrowUpRight, TrendingUp, Clock, ChevronRight,  ArrowDownLeft, ArrowUpLeft } from 'lucide-react';




interface Account {
  accountId: number;
  accountName: string | null;
  accountNumber: string;
  accountStatus: string;
  accountType: string;
  availableBalance: number;
  blockedFunds: number;
  branchCode: string;
  clearedBalance: number;
  currencyCode: string;
  currentBalance: number;
  dateCreated: string; // or Date if you convert it
  overdraftLimit: number;
  productCode: string;
}


interface Transaction {
  id: number;
  approver: string;
  balanceAfter: number;
  balanceBefore: number;
  creditAmount: number;
  debitAmount: number;
  narration: string;
  referenceNumber: string;
  transactionDate: number;  // looks like a timestamp (ms)
  valueDate: string;        // or Date if you convert it
}


const Account = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [visibleAccounts, setVisibleAccounts] = useState<Set<number>>(new Set());
const [selectedAccount, setSelectedAccount] = useState<Partial<Account> | null>(null);
const [loadingTransactions, setLoadingTransactions] = useState(false);
const [user, setUser] = useState<string | null>(null);

const url = import.meta.env.VITE_BASE_URL

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

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

  useEffect(() => {
    if (!userId) return;


    fetch(`http://localhost:8090/kamakfund/rest/kamak/customer/${userId}/accounts`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 1) {
          setAccounts(data.data);
          console.log('Fetched accounts:', data.data);
        } else {
          console.error(data.message);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching accounts:', err);
        setLoading(false);
      });
  }, [userId]);

  const fetchTransactions = async (account: Account) => {
    setLoadingTransactions(true);
    setSelectedAccount(account);
    setTransactions([]);
    
    try {
      const res = await fetch(`http://localhost:8090/kamakfund/rest/kamak/customer/${userId}/account/${account.accountId}/transactions`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await res.json();
      if (data.status === 1) {
        console.log('Fetched transactions:', data.data);
        setTransactions(data.data);
      } else {
        console.error('Error:', data.message);
        setTransactions([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const formatCurrency = (amount?: number | string | null) => {
    const num = Number(amount) || 0;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const maskAccountNumber = (accountNumber: string, isVisible: boolean) => {
    if (isVisible) return accountNumber;
    if (accountNumber.length <= 5) return accountNumber;
    const visiblePart = accountNumber.slice(-5);
    const maskedPart = '• '.repeat(Math.ceil((accountNumber.length - 5) / 2));
    return maskedPart + visiblePart;
  };

  const toggleAccountVisibility = (accountId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setVisibleAccounts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (timestamp: number | string) => {
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (creditAmount: number) => {
    if (creditAmount > 0) {
      return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
    }
    return <ArrowUpLeft className="w-5 h-5 text-red-600" />;
  };

  const getTransactionColor = (creditAmount: number) => {
    if (creditAmount > 0) {
      return 'text-green-600';
    }
    return 'text-red-600';
  };

  

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="flex gap-6 overflow-hidden mb-8">
              <div className="h-48 bg-gray-200 rounded-xl min-w-[340px]"></div>
              <div className="h-48 bg-gray-200 rounded-xl min-w-[340px]"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-24 bg-gray-200 rounded-xl"></div>
              <div className="h-24 bg-gray-200 rounded-xl"></div>
              <div className="h-24 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.availableBalance, 0);
  const totalCurrent = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const totalBlocked = accounts.reduce((sum, acc) => sum + acc.blockedFunds, 0);

  return (
    <div className="min-h-screen   bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6  ">
        
        {/* Header Section */}
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <p className="text-gray-500 text-sm">Manage your accounts and view balances</p>
          {user && (
            <p className="text-gray-600 text-sm border-b border-slate-200 pb-4  font-medium mt-1">
              Welcome, {user}
            </p>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
  

          <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Total Balance</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">{formatCurrency(totalBalance)}</p>
            <p className="text-xs text-gray-500">Available across all accounts</p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Current Balance</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">{formatCurrency(totalCurrent)}</p>
            <p className="text-xs text-gray-500">Total current balance</p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Blocked Funds</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">{formatCurrency(totalBlocked)}</p>
            <p className="text-xs text-gray-500">Temporarily held</p>
          </div>
        </div>

        {/* Accounts Section */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Accounts</h2>
            <span className="text-sm text-gray-500">{accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}</span>
          </div>
        </div>

        {/* Horizontal Scrolling Accounts */}
        {accounts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
            <p className="text-sm text-gray-500">You don't have any accounts yet</p>
          </div>
        ) : (
          <div className="relative -mx-4 sm:mx-0">
            <div className="flex gap-4 overflow-x-auto px-4 sm:px-0 pb-4 scroll-smooth snap-x snap-mandatory custom-scrollbar">
              {accounts.map((account) => {
                const isVisible = visibleAccounts.has(account.accountId);
                const isActive = selectedAccount?.accountId === account.accountId;
                return (
                  <div
                    key={account.accountId}
                    onClick={() => fetchTransactions(account)}
                    className={`min-w-[340px] shrink-0 bg-white rounded-xl border-2 transition-all duration-200 cursor-pointer snap-start group ${
                      isActive 
                        ? 'border-red-500 shadow-lg ring-2 ring-red-100' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="p-6">
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                              isActive 
                                ? 'bg-red-100 text-red-800 border-red-200' 
                                : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                              {account.accountType}
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {account.accountName || 'Account'}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-gray-600">
                              {maskAccountNumber(account.accountNumber, isVisible)}
                            </span>
                            <button
                              onClick={(e) => toggleAccountVisibility(account.accountId, e)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              {isVisible ? (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              ) : (
                                <Eye className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Balance Display */}
                      <div className="mb-6">
                        <p className="text-xs text-gray-500 mb-1">Available Balance</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-semibold text-gray-900">
                            {formatCurrency(account.availableBalance)}
                          </span>
                          <span className="text-lg text-gray-500 font-medium">{account.currencyCode}</span>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Balance</p>
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(account.currentBalance)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Available Balance</p>
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(account.clearedBalance)}</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Opened {formatDate(account.dateCreated)}</span>
                        <ChevronRight className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'
                        }`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Statement Section Below */}
        {!selectedAccount ? (
          <div className="mt-8 bg-white rounded-xl p-12 text-center border border-gray-200">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChevronRight className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Account</h3>
            <p className="text-sm text-gray-500">Click on an account above to view its statement</p>
          </div>
        ) : (
          <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Statement Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-red-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">Account Statement</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedAccount?.accountName} • {selectedAccount?.accountNumber}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  
                </div>
              </div>
            </div>

            {/* Account Summary */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Available Balance</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">
                    {selectedAccount?.currencyCode} {formatCurrency(selectedAccount?.availableBalance || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Current Balance</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">
                    {selectedAccount?.currencyCode} {formatCurrency(selectedAccount?.currentBalance || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Account Name</p>
                  <p className="text-sm font-medium text-gray-900">{selectedAccount?.accountType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Branch</p>
                  <p className="text-sm font-medium text-gray-900">{selectedAccount?.branchCode}</p>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="overflow-hidden">
              {loadingTransactions ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading transactions...</p>
                  </div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                    <p className="text-sm text-gray-500">There are no transactions for this account yet</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Narration</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((txn, index) => (
                        <tr key={txn.id || index} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>{formatDateTime(txn.transactionDate)}</div>
                            {txn.valueDate && (
                              <div className="text-xs text-gray-500">Value: {txn.valueDate}</div>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs">{txn.narration || 'N/A'}</div>
                            {txn.approver && (
                              <div className="text-xs text-gray-500 mt-1">Approved by: {txn.approver}</div>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                            {txn.referenceNumber || 'N/A'}
                          </td>
                          
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                            {txn.debitAmount > 0 ? formatCurrency(txn.debitAmount) : '-'}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                            {txn.creditAmount > 0 ? formatCurrency(txn.creditAmount) : '-'}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                            {formatCurrency(txn.balanceAfter)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Statement Footer */}
            {!loadingTransactions && transactions.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <p>Statement generated on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p>{transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 100px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 100px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default Account;