import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface InfoTooltipProps {
  text: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return ( 
    <div className="relative inline-flex items-center ml-2">
      <button
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="text-gray-500 hover:text-accent transition-colors focus:outline-none"
        aria-label="More info"
      >
        <HelpCircle size={14} />
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-surface border border-gray-700 rounded-lg shadow-xl z-50 text-xs text-gray-300 leading-relaxed"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-gray-700" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InfoTooltip;