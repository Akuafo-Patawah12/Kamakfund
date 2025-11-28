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

  const CalculatorCard = ({ title, bgColor, children }) => (
    <div className={`${bgColor} rounded-lg p-6 shadow-md`}>
      <h2 className="text-gray-700 text-sm font-medium mb-4">{title}</h2>
      {children}
    </div>
  );

  const InputField = ({ label, value, onChange, readOnly = false }) => (
    <div className="grid grid-cols-2 gap-4 mb-3">
      <label className="text-gray-600 text-sm py-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`border border-gray-300 rounded px-3 py-2 text-sm ${readOnly ? 'bg-gray-100' : 'bg-white'}`}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Annuity Future Value Calculator */}
          <CalculatorCard 
            title="Finding the future value of constant Monthly investments (annuity)" 
            bgColor="bg-pink-100"
          >
            <InputField 
              label="Monthly Investments" 
              value={annuityFV.monthlyInvestment}
              onChange={(e) => setAnnuityFV({...annuityFV, monthlyInvestment: e.target.value})}
            />
            <InputField 
              label="Interest Rate" 
              value={annuityFV.interestRate}
              onChange={(e) => setAnnuityFV({...annuityFV, interestRate: e.target.value})}
            />
            <InputField 
              label="Number of Years" 
              value={annuityFV.years}
              onChange={(e) => setAnnuityFV({...annuityFV, years: e.target.value})}
            />
            <InputField 
              label="Compoundings per year (Optional)" 
              value={annuityFV.compounding}
              onChange={(e) => setAnnuityFV({...annuityFV, compounding: e.target.value})}
            />
            <InputField 
              label="Future Value" 
              value={annuityFV.futureValue}
              readOnly={true}
            />
            <div className="flex justify-start mt-2">
              <button 
                onClick={calculateAnnuityFV}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-8 rounded"
              >
                Calculate
              </button>
            </div>
          </CalculatorCard>

          {/* Annuity Payment Calculator */}
          <CalculatorCard 
            title="Finding the investment per month needed (an annuity) to reach a desired future value" 
            bgColor="bg-pink-200"
          >
            <InputField 
              label="Future Value" 
              value={annuityPMT.futureValue}
              onChange={(e) => setAnnuityPMT({...annuityPMT, futureValue: e.target.value})}
            />
            <InputField 
              label="Interest Rate" 
              value={annuityPMT.interestRate}
              onChange={(e) => setAnnuityPMT({...annuityPMT, interestRate: e.target.value})}
            />
            <InputField 
              label="Number of Years" 
              value={annuityPMT.years}
              onChange={(e) => setAnnuityPMT({...annuityPMT, years: e.target.value})}
            />
            <InputField 
              label="Compoundings per year (Optional)" 
              value={annuityPMT.compounding}
              onChange={(e) => setAnnuityPMT({...annuityPMT, compounding: e.target.value})}
            />
            <InputField 
              label="Monthly Deposits" 
              value={annuityPMT.monthlyDeposit}
              readOnly={true}
            />
            <div className="flex justify-start mt-2">
              <button 
                onClick={calculateAnnuityPMT}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-8 rounded"
              >
                Calculate
              </button>
            </div>
          </CalculatorCard>

          {/* Lump Sum Future Value Calculator */}
          <CalculatorCard 
            title="Finding the future value of a one-time investment" 
            bgColor="bg-orange-100"
          >
            <InputField 
              label="Investment Amount" 
              value={lumpSumFV.investment}
              onChange={(e) => setLumpSumFV({...lumpSumFV, investment: e.target.value})}
            />
            <InputField 
              label="Interest Rate" 
              value={lumpSumFV.interestRate}
              onChange={(e) => setLumpSumFV({...lumpSumFV, interestRate: e.target.value})}
            />
            <InputField 
              label="Number of Years" 
              value={lumpSumFV.years}
              onChange={(e) => setLumpSumFV({...lumpSumFV, years: e.target.value})}
            />
            <InputField 
              label="Compoundings per year (Optional)" 
              value={lumpSumFV.compounding}
              onChange={(e) => setLumpSumFV({...lumpSumFV, compounding: e.target.value})}
            />
            <InputField 
              label="Future Value" 
              value={lumpSumFV.futureValue}
              readOnly={true}
            />
            <div className="flex justify-start mt-2">
              <button 
                onClick={calculateLumpSumFV}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-8 rounded"
              >
                Calculate
              </button>
            </div>
          </CalculatorCard>

          {/* Lump Sum Present Value Calculator */}
          <CalculatorCard 
            title="Finding the one-time investment needed to reach a desired future value" 
            bgColor="bg-orange-200"
          >
            <InputField 
              label="Future Value" 
              value={lumpSumPV.futureValue}
              onChange={(e) => setLumpSumPV({...lumpSumPV, futureValue: e.target.value})}
            />
            <InputField 
              label="Interest Rate" 
              value={lumpSumPV.interestRate}
              onChange={(e) => setLumpSumPV({...lumpSumPV, interestRate: e.target.value})}
            />
            <InputField 
              label="Number of Years" 
              value={lumpSumPV.years}
              onChange={(e) => setLumpSumPV({...lumpSumPV, years: e.target.value})}
            />
            <InputField 
              label="Compoundings per year (Optional)" 
              value={lumpSumPV.compounding}
              onChange={(e) => setLumpSumPV({...lumpSumPV, compounding: e.target.value})}
            />
            <InputField 
              label="Investment Amount" 
              value={lumpSumPV.investment}
              readOnly={true}
            />
            <div className="flex justify-start mt-2">
              <button 
                onClick={calculateLumpSumPV}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-8 rounded"
              >
                Calculate
              </button>
            </div>
          </CalculatorCard>
        </div>
      </div>
    </div>
  );
};

export default InvestmentCalculator;