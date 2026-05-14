import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  return (
    <div className="mx-6 my-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-red-400 font-medium mb-1">Error</h4>
          <p className="text-red-300 text-sm">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 flex items-center gap-2 px-3 py-1 text-xs bg-red-800/30 hover:bg-red-800/50 text-red-300 hover:text-red-200 rounded border border-red-600/30 hover:border-red-500/50 transition-all duration-200"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}