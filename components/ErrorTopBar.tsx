'use client';

import { AlertCircle, X } from 'lucide-react';

interface ErrorTopBarProps {
  message: string | null;
  onClose: () => void;
}

export default function ErrorTopBar({ message, onClose }: ErrorTopBarProps) {
  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out transform ${
        message ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3 text-sm font-semibold tracking-wide">
          <div className="bg-white/20 p-1 rounded-full">
            <AlertCircle size={20} className="text-white" />
          </div>
          <p className="leading-tight max-w-2xl">{message || 'An error occurred'}</p>
        </div>
        <button 
          onClick={onClose} 
          className="hover:bg-white/20 p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
          aria-label="Dismiss Error"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
