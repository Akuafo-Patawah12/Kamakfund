import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';        

interface PageContent {
  title: string;
  subtitle: string;
}

const SessionExpiredPage: React.FC = () => {
  const [pageContent, setPageContent] = useState<PageContent>({
    title: 'Your session has expired',
    subtitle: "For your security, we've logged you out after a period of inactivity. Please log in again to continue where you left off."
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reason = urlParams.get('reason');
    
    if (reason === 'unauthorized') {
      setPageContent({
        title: 'Please log in to continue',
        subtitle: 'You need to be logged in to access this page. Log in to view your content and continue working.'
      });
    } else if (reason === 'required') {
      setPageContent({
        title: 'Authentication required',
        subtitle: 'This page requires authentication. Please log in with your credentials to access this content.'
      });
    }
  }, []);

  const handleLogin = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-xl font-semibold text-red-700" style={{ letterSpacing: '-0.5px' }}>
            KAMAKFUND
          </div>
          <nav className="flex gap-6">
            <Link to="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Login
            </Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              About
            </Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Support
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-8 py-20">
        <div className="w-full max-w-xl">
          {/* Icon */}
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-8">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className="w-8 h-8 text-gray-600"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-4xl font-semibold text-gray-900 mb-4 leading-tight" style={{ letterSpacing: '-1px' }}>
            {pageContent.title}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-10">
            {pageContent.subtitle}
          </p>

          {/* Login Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mb-8">
            <div className="text-sm font-semibold text-gray-900 mb-5">
              Continue to your account
            </div>
            <button 
              onClick={handleLogin}
              className="w-full bg-slate-900 text-white py-3.5 px-6 rounded-md font-medium text-base hover:bg-gray-700 active:scale-[0.98] transition-all"
            >
              Log In
            </button>
          </div>

          {/* Info Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-base font-semibold text-gray-900 mb-3">
              Why did this happen?
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              We automatically log users out after periods of inactivity to protect your account and data.
            </p>
            
            <ul className="mt-4 space-y-3">
              <li className="text-sm text-gray-600 pl-7 relative leading-relaxed">
                <span className="absolute left-3 text-gray-400">•</span>
                Your work has been saved automatically
              </li>
              <li className="text-sm text-gray-600 pl-7 relative leading-relaxed">
                <span className="absolute left-3 text-gray-400">•</span>
                All your data remains secure and encrypted
              </li>
              <li className="text-sm text-gray-600 pl-7 relative leading-relaxed">
                <span className="absolute left-3 text-gray-400">•</span>
                You can pick up right where you left off after logging in
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 px-8 py-8 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400">
            © 2025 KAMAKFUND. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Help Center
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SessionExpiredPage;