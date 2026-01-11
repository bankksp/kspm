
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-400"></div>
        <p className="text-lg text-slate-300">กำลังโหลดข้อมูลเกียรติบัตร...</p>
    </div>
  );
};

export default LoadingSpinner;
