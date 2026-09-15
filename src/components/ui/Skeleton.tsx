import React from 'react';
import { motion } from 'motion/react';

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <motion.div 
    className={`bg-gray-800/50 rounded-lg overflow-hidden relative ${className}`}
    initial={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }}
  >
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
  </motion.div>
);

export const CardSkeleton = () => (
  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4 shadow-sm">
    <div className="flex items-center space-x-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
    <Skeleton className="h-24 w-full" />
    <div className="flex justify-between pt-2 border-t border-gray-800/50">
      <Skeleton className="h-8 w-24 rounded-md" />
      <Skeleton className="h-8 w-24 rounded-md" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="w-full bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
    <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-800 bg-gray-800/20">
      {[1, 2, 3, 4].map(i => <React.Fragment key={i}><Skeleton className="h-4 w-full" /></React.Fragment>)}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b border-gray-800/50">
        {[1, 2, 3, 4].map(j => <React.Fragment key={j}><Skeleton className="h-4 w-full" /></React.Fragment>)}
      </div>
    ))}
  </div>
);

export const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-8 p-6">
    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 bg-gray-900/50 p-8 rounded-2xl border border-gray-800 shadow-sm">
      <Skeleton className="w-32 h-32 rounded-full" />
      <div className="space-y-4 flex-1 w-full text-center md:text-left">
        <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
        <Skeleton className="h-4 w-64 mx-auto md:mx-0" />
        <div className="flex justify-center md:justify-start space-x-4 pt-4">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
    </div>
  </div>
);
