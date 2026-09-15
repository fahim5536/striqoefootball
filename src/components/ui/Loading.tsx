import React from 'react';
import { motion } from 'motion/react';

export const LoadingSpinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-indigo-500/30 border-t-indigo-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </motion.div>
    </div>
  );
};

export const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col justify-center items-center space-y-4">
    <LoadingSpinner size="lg" />
    <motion.p 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-gray-400 font-medium"
    >
      Loading STRIQO...
    </motion.p>
  </div>
);
