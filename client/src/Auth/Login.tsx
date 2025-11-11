import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff,Activity, Shield, CreditCard, TrendingUp, DollarSign, PieChart, Wallet, BarChart3 } from 'lucide-react';

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    accountNumber: string;
  };
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setFormErrors({});
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials. Please try again.');
      }

      console.log('Login successful:', data);
      alert(`Welcome back! Account: ${data.user?.accountNumber || 'N/A'}`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to connect. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
    if (formErrors.email) {
      setFormErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
    if (formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Left */}
        <div className="absolute top-16 left-12 opacity-[0.03] dark:opacity-[0.08] animate-float">
          <CreditCard className="w-20 h-20 text-slate-400" strokeWidth={1} />
        </div>

        {/* Top Right */}
        <div className="absolute top-24 right-16 opacity-[0.04] dark:opacity-[0.09] animate-float-delay-1">
          <TrendingUp className="w-16 h-16 text-slate-400" strokeWidth={1} />
        </div>

        {/* Middle Left */}
        <div className="absolute top-1/3 left-8 opacity-[0.03] dark:opacity-[0.08] animate-float-delay-2">
          <DollarSign className="w-24 h-24 text-slate-400" strokeWidth={1} />
        </div>

        {/* Middle Right */}
        <div className="absolute top-1/2 right-12 opacity-[0.04] dark:opacity-[0.08] animate-float-delay-3">
          <PieChart className="w-18 h-18 text-slate-400" strokeWidth={1} />
        </div>

        {/* Bottom Left */}
        <div className="absolute bottom-32 left-20 opacity-[0.03] dark:opacity-[0.09] animate-float">
          <Wallet className="w-16 h-16 text-slate-400" strokeWidth={1} />
        </div>

        {/* Bottom Right */}
        <div className="absolute bottom-24 right-24 opacity-[0.04] dark:opacity-[0.08] animate-float-delay-1">
          <BarChart3 className="w-20 h-20 text-slate-400" strokeWidth={1} />
        </div>

        {/* SVG Patterns */}
        <div className="absolute top-1/4 right-1/4 opacity-[0.02] dark:opacity-[0.06]">
          <svg
            width="100"
            height="100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-slate-400"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="1" />
            <path d="M2 10h20" strokeWidth="1" />
            <circle cx="6" cy="15" r="1" fill="currentColor" />
          </svg>
        </div>

        <div className="absolute bottom-1/3 left-1/4 opacity-[0.03] dark:opacity-[0.07]">
          <svg
            width="90"
            height="90"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-slate-400"
          >
            <path
              d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
              strokeWidth="1"
            />
          </svg>
        </div>

        <div className="absolute top-2/3 right-1/3 opacity-[0.02] dark:opacity-[0.09]">
          <svg
            width="85"
            height="85"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-slate-400"
          >
            <polyline
              points="22 12 18 12 15 21 9 3 6 12 2 12"
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-6 h-6 text-white dark:text-slate-900" />
          </div>
          <h1 className="text-red-500 font-bold text-xl">KAMAKFUND</h1>

          <p className="text-gray-600 dark:text-gray-400">
            Sign in to access your account
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.form?.requestSubmit(); // programmatically submits the form
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border ${
                    formErrors.email
                      ? "border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:border-slate-900 dark:focus:border-slate-300 focus:ring-slate-900 dark:focus:ring-slate-300"
                  } rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all`}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              {formErrors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.form?.requestSubmit(); // programmatically submits the form
                    }
                  }}
                  className={`w-full pl-10 pr-12 py-2 bg-white dark:bg-gray-700 border ${
                    formErrors.password
                      ? "border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:border-slate-900 dark:focus:border-slate-300 focus:ring-slate-900 dark:focus:ring-slate-300"
                  } rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-300 focus:ring-slate-900 dark:focus:ring-slate-300 focus:ring-offset-0 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-slate-900 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-linear-to-r from-slate-900 to-slate-700 dark:from-slate-200 dark:to-slate-400 text-white dark:text-slate-900 py-2 px-4 rounded-lg font-semibold hover:from-slate-800 hover:to-slate-600 dark:hover:from-slate-300 dark:hover:to-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-300 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-slate-900"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <Shield className="w-4 h-4 mt-0.5 shrink-0 text-slate-600 dark:text-slate-400" />
              <p>
                Your connection is secure. We use bank-level encryption to
                protect your account information.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-400 font-medium">
                Bank-grade security
              </span>
            </div>
          </div>

          {/* Security Features */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Shield, label: "256-bit SSL" },
              { icon: Lock, label: "Encrypted" },
              { icon: Activity, label: "Monitored" },
            ].map(({ icon: Icon, label }, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
              >
                <Icon
                  className="w-4 h-4 text-gray-600 dark:text-gray-400 mb-2"
                  strokeWidth={1.5}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help?{" "}
            <button className="text-slate-900 dark:text-slate-300 font-semibold hover:text-slate-700 dark:hover:text-slate-100 transition-colors">
              Contact Support
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delay-1 {
          animation: float 10s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .animate-float-delay-2 {
          animation: float 12s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .animate-float-delay-3 {
          animation: float 9s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  );
}