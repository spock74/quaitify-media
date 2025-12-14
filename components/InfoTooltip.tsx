import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface InfoTooltipProps {
  text: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return ( 
    <div className="relative inline-flex items-center ml-2 group">
      <button
        onClick={(e) => { e.preventDefault(); setIsVisible(!isVisible); }}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="text-gray-500 hover:text-accent transition-colors focus:outline-none"
        aria-label="More info"
        type="button"
      >
        <HelpCircle size={14} />
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute top-full mt-3 z-50 p-4 bg-surface border border-gray-700 rounded-lg shadow-2xl text-xs text-gray-300 leading-relaxed whitespace-pre-line
              w-64 max-w-[85vw]
              left-1/2 -translate-x-1/2
              md:w-96 md:left-0 md:-translate-x-4
            `}
          >
            {/* Seta do Tooltip (Apontando para cima) */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 md:left-5 md:translate-x-0 -mb-[1px] border-4 border-transparent border-b-gray-700" />
            
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InfoTooltip;