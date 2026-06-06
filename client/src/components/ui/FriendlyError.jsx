import { Link } from 'react-router-dom';
import {
  WifiOff,
  Sparkles,
  SearchX,
  MapPinOff,
  RefreshCw,
} from 'lucide-react';

const VARIANTS = {
  network: {
    icon: WifiOff,
    title: 'Connection trouble',
    description:
      'We could not reach the server. Check your internet connection, then refresh the page.',
    iconClass: 'text-orange-600 dark:text-orange-400',
    bgClass: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50',
  },
  gemini: {
    icon: Sparkles,
    title: 'AI service unavailable',
    description:
      'Roadmap or quiz generation hit a temporary AI issue. Please try again—we will use a backup plan if needed.',
    iconClass: 'text-violet-600 dark:text-violet-400',
    bgClass: 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-900/50',
  },
  notFound: {
    icon: MapPinOff,
    title: 'Page not found',
    description: 'The page you are looking for does not exist or has been moved.',
    iconClass: 'text-gray-600 dark:text-gray-400',
    bgClass: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700',
  },
  noResults: {
    icon: SearchX,
    title: 'No matches for your roadmap',
    description:
      'Nothing in our catalog matched your current career, stream, and topics. Try updating your roadmap or check back after we expand content.',
    iconClass: 'text-primary-600 dark:text-primary-400',
    bgClass: 'bg-primary-50 dark:bg-primary-950/20 border-primary-200 dark:border-primary-900/50',
  },
};

const FriendlyError = ({
  variant = 'noResults',
  title,
  description,
  onRetry,
  actionLabel,
  actionTo,
  compact = false,
}) => {
  const config = VARIANTS[variant] || VARIANTS.noResults;
  const Icon = config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <div
      className={`text-center rounded-xl border ${config.bgClass} ${
        compact ? 'py-10 px-6' : 'py-16 px-8'
      }`}
      role="alert"
    >
      <div
        className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${config.bgClass}`}
      >
        <Icon className={`w-7 h-7 ${config.iconClass}`} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {displayTitle}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
        {displayDescription}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-primary inline-flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </button>
        )}
        {actionTo && (
          <Link to={actionTo} className="btn-secondary inline-flex items-center">
            {actionLabel || 'Go back'}
          </Link>
        )}
        {variant === 'notFound' && !actionTo && (
          <Link to="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
};

export default FriendlyError;
