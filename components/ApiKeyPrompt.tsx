
import React from 'react';
import { KeyIcon } from './icons/KeyIcon';

interface ApiKeyPromptProps {
  onSelectKey: () => void;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onSelectKey }) => {
  return (
    <div className="flex items-center justify-center" style={{height: 'calc(100vh - 128px)'}}>
      <div className="max-w-md w-full text-center p-8 bg-slate-800/50 border border-slate-700 rounded-lg shadow-lg">
        <div className="mx-auto mb-4 flex items-center justify-center h-16 w-16 rounded-full bg-sky-900/50">
           <KeyIcon className="h-8 w-8 text-sky-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">จำเป็นต้องใช้ API Key</h2>
        <p className="text-slate-300 mb-6">
          เพื่อเข้าถึงเกียรติบัตรจาก Google Drive คุณต้องเลือก API Key จากโปรเจกต์ Google Cloud ที่ชำระเงินแล้ว
        </p>
         <p className="text-xs text-slate-400 mb-6">
           โปรดตรวจสอบให้แน่ใจว่า Google Drive API ได้รับการเปิดใช้งานในโปรเจกต์ของคุณแล้ว ดูข้อมูลเพิ่มเติมเกี่ยวกับการเรียกเก็บเงินได้ที่{' '}
           <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
             ai.google.dev/gemini-api/docs/billing
           </a>.
         </p>
        <button
          onClick={onSelectKey}
          className="w-full bg-sky-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500"
        >
          เลือก API Key
        </button>
      </div>
    </div>
  );
};

export default ApiKeyPrompt;
