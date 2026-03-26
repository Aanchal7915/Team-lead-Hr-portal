import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#433020]/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white/95 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-white/50 dark:border-gray-700 animate-scale-in">
        <div className="flex justify-between items-center p-6 border-b border-[#8a6144]/10 dark:border-gray-700">
          <h3 className="text-xl md:text-2xl font-bold text-[#433020] dark:text-gray-100 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#8a6144] rounded-full inline-block"></span>
            {title}
          </h3>
          <button onClick={onClose} className="text-[#8a6144] hover:text-[#433020] dark:hover:text-white text-3xl transition-colors leading-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
