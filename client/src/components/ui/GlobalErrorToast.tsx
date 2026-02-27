import React, { useEffect } from "react";
import { useErrorStore } from "@/stores/useErrorStore";

const AUTO_DISMISS_MS = 5000;

export const GlobalErrorToast: React.FC = () => {
  const { errors, removeError } = useErrorStore();

  useEffect(() => {
    const timers = errors.map((error) =>
      window.setTimeout(() => removeError(error.id), AUTO_DISMISS_MS),
    );
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [errors, removeError]);

  if (errors.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {errors.map((error) => (
        <div
          key={error.id}
          className="min-w-60 max-w-85 rounded-xl bg-red-600 text-white shadow-lg px-4 py-3 text-sm flex items-start gap-3 animate-in fade-in"
        >
          <div className="flex-1">
            <p className="font-semibold">Error</p>
            <p className="text-red-100 mt-0.5">{error.message}</p>
          </div>
          <button
            type="button"
            onClick={() => removeError(error.id)}
            className="text-red-100 hover:text-white"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
