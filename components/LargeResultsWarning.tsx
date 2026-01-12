import React from 'react';
import { InformationCircleIcon } from './icons/InformationCircleIcon';

interface LargeResultsWarningProps {
  searchTerm: string;
  count: number;
}

const LargeResultsWarning: React.FC<LargeResultsWarningProps> = ({ searchTerm, count }) => {
  return (
    <div className="mb-8 p-4 bg-sky-900/40 border border-sky-500/30 rounded-lg flex items-start gap-4 animate-fade-in-up">
      <div className="flex-shrink-0 pt-0.5">
        <InformationCircleIcon className="w-6 h-6 text-sky-400" />
      </div>
      <div>
        <h4 className="font-bold text-sky-300">พบผลลัพธ์จำนวนมาก ({count.toLocaleString()} รายการ)</h4>
        <p className="text-slate-300 text-sm mt-1">
          การค้นหาสำหรับ <strong className="text-white">"{searchTerm}"</strong> ให้ผลลัพธ์ที่กว้างเกินไป 
          <br />
          <span className="text-slate-400">
            <strong>คำแนะนำ:</strong> ลองระบุคำค้นให้เฉพาะเจาะจงมากขึ้น เช่น เพิ่มชื่อ, นามสกุล หรือชื่อกิจกรรม
          </span>
        </p>
      </div>
    </div>
  );
};

export default LargeResultsWarning;
