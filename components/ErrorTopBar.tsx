'use client';

import { AlertCircle, X } from 'lucide-react';

interface ErrorTopBarProps {
  message: string | null;
  onClose: () => void;
}

export default function ErrorTopBar({ message, onClose }: ErrorTopBarProps) {
  if (!message) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-6 py-3 flex items-center justify-between shadow-lg transition-transform duration-300">
      <div className="flex items-center gap-3 text-sm font-medium">
        <AlertCircle size={18} />
        <span className="leading-none mt-0.5">{message}</span>
      </div>
      <button 
        onClick={onClose} 
        className="hover:bg-red-600 p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        aria-label="Dismiss Error"
      >
        <X size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
