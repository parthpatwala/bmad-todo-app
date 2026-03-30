interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onDismiss, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
      <p className="text-sm text-red-700">{message}</p>
      <div className="flex gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm font-medium text-red-700 hover:text-red-900"
          >
            Retry
          </button>
        )}
        <button
          onClick={onDismiss}
          className="text-sm text-red-400 hover:text-red-600"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
