import React, { useState } from 'react';
import { HelpCircle, X, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface InfoTooltipProps {
  text: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={(e) => { 
          e.preventDefault(); 
          setIsOpen(true); 
        }}
        className="ml-2 text-gray-500 hover:text-accent transition-colors focus:outline-none inline-flex items-center justify-center"
        aria-label="More info"
        type="button"
      >
        <HelpCircle size={14} />
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            {/* Modal Content Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#171717] border border-gray-700 w-full max-w-md rounded-xl shadow-2xl flex flex-col max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-surface/50 rounded-t-xl">
                <div className="flex items-center gap-2 text-accent">
                  <Info size={18} />
                  <h3 className="font-semibold text-sm uppercase tracking-wide">Detalhes da Opção</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body (Scrollable) */}
              <div className="p-5 overflow-y-auto custom-scrollbar text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {text}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-800 bg-surface/30 rounded-b-xl flex justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InfoTooltip;