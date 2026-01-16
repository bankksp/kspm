import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'large' | 'small';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message,
  size = 'large' 
}) => {
  const defaultMessage = 'กำลังโหลดข้อมูลเกียรติบัตร...';

  if (size === 'small') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 py-4">
        <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-sky-400"></div>
        {message && <p className="text-sm text-slate-400">{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-400"></div>
        <p className="text-lg text-slate-300">{message || defaultMessage}</p>
    </div>
  );
};

export default LoadingSpinner;