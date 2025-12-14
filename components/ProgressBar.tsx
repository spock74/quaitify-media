import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  status: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, status }) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs uppercase font-mono tracking-wider">
        <span className="text-accent animate-pulse">{status}</span>
        <span className="text-gray-400">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear" }}
          className="h-full bg-gradient-to-r from-blue-500 via-accent to-purple-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
        />
      </div>
    </div>
  );
}; 

export default ProgressBar;