import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center p-12 text-center bg-gray-900/30 rounded-2xl border border-gray-800/50 backdrop-blur-sm"
  >
    <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/5">
      <Icon className="w-8 h-8 text-indigo-400 opacity-80" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 max-w-md mb-6 leading-relaxed">{description}</p>
    {action && <div>{action}</div>}
  </motion.div>
);
