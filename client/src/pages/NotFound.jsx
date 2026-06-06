import { Link } from 'react-router-dom';
import { Compass, Home, HelpCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background visual shapes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500/10 dark:bg-primary-500/5 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/5 rounded-full filter blur-3xl animate-pulse delay-700"></div>
      
      <div className="max-w-md w-full text-center relative z-10">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-2xl border border-gray-100 dark:border-gray-700/50 rounded-3xl p-10 transition-all">
          <div className="flex flex-col items-center">
            {/* Pulsing floating compass icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary-500/20 rounded-2xl filter blur-md animate-ping opacity-75"></div>
              <div className="h-16 w-16 rounded-2xl bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center relative shadow-lg">
                <Compass className="h-8 w-8 animate-spin" style={{ animationDuration: '20s' }} />
              </div>
            </div>

            <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500 dark:from-primary-400 dark:to-blue-400 mb-2">
              404
            </h1>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Lost in Transition?
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed mb-8">
              We couldn't find the path you were looking for. The coordinates might be incorrect, or the page has been restructured.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Link
                to="/dashboard"
                className="flex items-center justify-center py-3 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/10 w-full sm:w-auto"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Dashboard
              </Link>
              <Link
                to="/chat"
                className="flex items-center justify-center py-3 px-6 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Ask AI Chat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
