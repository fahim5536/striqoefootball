import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullPage?: boolean;
}

export const ErrorState = ({ 
  title = "Something went wrong", 
  message = "We encountered an unexpected error. Please try again.", 
  onRetry,
  fullPage = false
}: ErrorStateProps) => {
  const content = (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center bg-red-500/10 rounded-2xl border border-red-500/20 max-w-lg mx-auto"
    >
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-xl font-bold text-red-100 mb-2">{title}</h3>
      <p className="text-red-200/70 mb-6">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center space-x-2 px-6 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors focus:ring-2 focus:ring-red-500/50 outline-none"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </motion.div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
};
