import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose, 
  id 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration !== Infinity) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "flex items-center justify-between p-4 rounded-xl backdrop-blur-xl border transition-all duration-300 ease-out transform";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50/90 border-green-200/50 text-black shadow-lg shadow-green-500/5`;
      case 'error':
        return `${baseStyles} bg-red-50/90 border-red-200/50 text-black shadow-lg shadow-red-500/5`;
      case 'warning':
        return `${baseStyles} bg-yellow-50/90 border-yellow-200/50 text-black shadow-lg shadow-yellow-500/5`;
      case 'loading':
        return `${baseStyles} bg-blue-50/90 border-blue-200/50 text-black shadow-lg shadow-blue-500/5`;
      default:
        return `${baseStyles} bg-gray-50/90 border-gray-200/50 text-black shadow-lg shadow-gray-500/5`;
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`${getStyles()} ${
        isExiting 
          ? 'opacity-0 translate-x-full scale-95' 
          : 'opacity-100 translate-x-0 scale-100'
      }`}
      style={{
        minWidth: '320px',
        maxWidth: '480px',
      }}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-black">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors duration-200"
        >
          <X className="w-4 h-4 text-black" />
        </button>
      </div>
      
      {/* Barra de progreso */}
      {duration !== Infinity && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-xl overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ease-linear ${
              type === 'success' ? 'bg-green-400' :
              type === 'error' ? 'bg-red-400' :
              type === 'warning' ? 'bg-yellow-400' :
              type === 'loading' ? 'bg-blue-400' :
              'bg-gray-400'
            }`}
            style={{
              width: isExiting ? '0%' : '100%',
              transition: isExiting ? 'width 0.3s ease-out' : `width ${duration}ms linear`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Toast; 