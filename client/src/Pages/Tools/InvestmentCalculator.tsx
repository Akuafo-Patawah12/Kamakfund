import React, { useState } from 'react';

const InvestmentCalculator = () => {
  // State for Annuity Future Value Calculator
  const [annuityFV, setAnnuityFV] = useState({
    monthlyInvestment: '1000.0',
    interestRate: '12.0',
    years: '10.0',
    compounding: '12.0',
    futureValue: '230,038.689'
  });

  // State for Annuity Payment Calculator
  const [annuityPMT, setAnnuityPMT] = useState({
    futureValue: '',
    interestRate: '',
    years: '',
    compounding: '',
    monthlyDeposit: ''
  });

  // State for Lump Sum Future Value Calculator
  const [lumpSumFV, setLumpSumFV] = useState({
    investment: '1000.0',
    interestRate: '10.0',
    years: '2.0',
    compounding: '1.0',
    futureValue: ''
  });

  // State for Lump Sum Present Value Calculator
  const [lumpSumPV, setLumpSumPV] = useState({
    futureValue: '',
    interestRate: '',
    years: '',
    compounding: '',
    investment: ''
  });

  const calculateAnnuityFV = () => {
    const P = parseFloat(annuityFV.monthlyInvestment);
    const r = parseFloat(annuityFV.interestRate) / 100;
    const n = parseFloat(annuityFV.compounding);
    const t = parseFloat(annuityFV.years);
    
    const FV = P * (Math.pow(1 + r/n, n*t) - 1) / (r/n);
    setAnnuityFV({...annuityFV, futureValue: FV.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})});
  };

  const calculateAnnuityPMT = () => {
    const FV = parseFloat(annuityPMT.futureValue);
    const r = parseFloat(annuityPMT.interestRate) / 100;
    const n = parseFloat(annuityPMT.compounding);
    const t = parseFloat(annuityPMT.years);
    
    const PMT = FV * (r/n) / (Math.pow(1 + r/n, n*t) - 1);
    setAnnuityPMT({...annuityPMT, monthlyDeposit: PMT.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})});
  };

  const calculateLumpSumFV = () => {
    const P = parseFloat(lumpSumFV.investment);
    const r = parseFloat(lumpSumFV.interestRate) / 100;
    const n = parseFloat(lumpSumFV.compounding);
    const t = parseFloat(lumpSumFV.years);
    
    const FV = P * Math.pow(1 + r/n, n*t);
    setLumpSumFV({...lumpSumFV, futureValue: FV.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})});
  };

  const calculateLumpSumPV = () => {
    const FV = parseFloat(lumpSumPV.futureValue);
    const r = parseFloat(lumpSumPV.interestRate) / 100;
    const n = parseFloat(lumpSumPV.compounding);
    const t = parseFloat(lumpSumPV.years);
    
    const PV = FV / Math.pow(1 + r/n, n*t);
    setLumpSumPV({...lumpSumPV, investment: PV.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Investment Calculator</h1>
              <p className="text-sm text-gray-600 mt-1">Financial planning and analysis tools</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Suite</div>
              <div className="text-sm font-medium text-gray-900">Professional Edition</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: Annuity Future Value */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Annuity Future Value</h3>
                  <p className="text-xs text-gray-500 mt-1">Recurring investment growth calculation</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Monthly Investment</label>
                  <input
                    type="text"
                    value={annuityFV.monthlyInvestment}
                    onChange={(e) => setAnnuityFV({...annuityFV, monthlyInvestment: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Interest Rate (%)</label>
                  <input
                    type="text"
                    value={annuityFV.interestRate}
                    onChange={(e) => setAnnuityFV({...annuityFV, interestRate: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Time Period (Years)</label>
                  <input
                    type="text"
                    value={annuityFV.years}
                    onChange={(e) => setAnnuityFV({...annuityFV, years: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Compounding Frequency</label>
                  <input
                    type="text"
                    value={annuityFV.compounding}
                    onChange={(e) => setAnnuityFV({...annuityFV, compounding: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-medium text-gray-500 mb-2">CALCULATED FUTURE VALUE</label>
                <div className="text-3xl font-semibold text-gray-900 tracking-tight">${annuityFV.futureValue}</div>
              </div>
              <button 
                onClick={calculateAnnuityFV}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2.5 px-4 rounded transition-colors"
              >
                Calculate
              </button>
            </div>
          </div>

          {/* Card 2: Annuity Payment */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Required Monthly Payment</h3>
                  <p className="text-xs text-gray-500 mt-1">Target-based investment planning</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Target Future Value</label>
                  <input
                    type="text"
                    value={annuityPMT.futureValue}
                    onChange={(e) => setAnnuityPMT({...annuityPMT, futureValue: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Interest Rate (%)</label>
                  <input
                    type="text"
                    value={annuityPMT.interestRate}
                    onChange={(e) => setAnnuityPMT({...annuityPMT, interestRate: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Time Period (Years)</label>
                  <input
                    type="text"
                    value={annuityPMT.years}
                    onChange={(e) => setAnnuityPMT({...annuityPMT, years: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Compounding Frequency</label>
                  <input
                    type="text"
                    value={annuityPMT.compounding}
                    onChange={(e) => setAnnuityPMT({...annuityPMT, compounding: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-medium text-gray-500 mb-2">REQUIRED MONTHLY DEPOSIT</label>
                <div className="text-3xl font-semibold text-gray-900 tracking-tight">${annuityPMT.monthlyDeposit}</div>
              </div>
              <button 
                onClick={calculateAnnuityPMT}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2.5 px-4 rounded transition-colors"
              >
                Calculate
              </button>
            </div>
          </div>

          {/* Card 3: Lump Sum Future Value */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Lump Sum Future Value</h3>
                  <p className="text-xs text-gray-500 mt-1">One-time investment projection</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Initial Investment</label>
                  <input
                    type="text"
                    value={lumpSumFV.investment}
                    onChange={(e) => setLumpSumFV({...lumpSumFV, investment: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Interest Rate (%)</label>
                  <input
                    type="text"
                    value={lumpSumFV.interestRate}
                    onChange={(e) => setLumpSumFV({...lumpSumFV, interestRate: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Time Period (Years)</label>
                  <input
                    type="text"
                    value={lumpSumFV.years}
                    onChange={(e) => setLumpSumFV({...lumpSumFV, years: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Compounding Frequency</label>
                  <input
                    type="text"
                    value={lumpSumFV.compounding}
                    onChange={(e) => setLumpSumFV({...lumpSumFV, compounding: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-medium text-gray-500 mb-2">PROJECTED FUTURE VALUE</label>
                <div className="text-3xl font-semibold text-gray-900 tracking-tight">${lumpSumFV.futureValue}</div>
              </div>
              <button 
                onClick={calculateLumpSumFV}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2.5 px-4 rounded transition-colors"
              >
                Calculate
              </button>
            </div>
          </div>

          {/* Card 4: Lump Sum Present Value */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Required Lump Sum</h3>
                  <p className="text-xs text-gray-500 mt-1">Present value calculation</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Target Future Value</label>
                  <input
                    type="text"
                    value={lumpSumPV.futureValue}
                    onChange={(e) => setLumpSumPV({...lumpSumPV, futureValue: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Interest Rate (%)</label>
                  <input
                    type="text"
                    value={lumpSumPV.interestRate}
                    onChange={(e) => setLumpSumPV({...lumpSumPV, interestRate: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Time Period (Years)</label>
                  <input
                    type="text"
                    value={lumpSumPV.years}
                    onChange={(e) => setLumpSumPV({...lumpSumPV, years: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Compounding Frequency</label>
                  <input
                    type="text"
                    value={lumpSumPV.compounding}
                    onChange={(e) => setLumpSumPV({...lumpSumPV, compounding: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-medium text-gray-500 mb-2">REQUIRED INITIAL INVESTMENT</label>
                <div className="text-3xl font-semibold text-gray-900 tracking-tight">${lumpSumPV.investment}</div>
              </div>
              <button 
                onClick={calculateLumpSumPV}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2.5 px-4 rounded transition-colors"
              >
                Calculate
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>© 2024 Investment Calculator Suite</div>
            <div>For informational purposes only</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentCalculator;