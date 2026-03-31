interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onDismiss, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
      <p className="text-sm text-red-700">{message}</p>
      <div className="flex gap-2 shrink-0">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[44px] px-2 text-sm font-medium text-red-700 hover:text-red-900"
          >
            Retry
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="min-h-[44px] px-2 text-sm text-red-400 hover:text-red-600"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
