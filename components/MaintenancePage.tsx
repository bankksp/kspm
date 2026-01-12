
import React from 'react';
import { Link } from 'react-router-dom';
import { LockIcon } from './icons/LockIcon';

const MaintenancePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white relative overflow-hidden">
      {/* Admin Access Button - High Visibility */}
      <div className="absolute top-6 right-6 z-50">
        <Link 
          to="/admin" 
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white transition-all backdrop-blur-sm shadow-lg group"
        >
           <LockIcon className="w-4 h-4 group-hover:text-sky-400 transition-colors" />
           <span className="text-sm font-medium">เข้าสู่ระบบ</span>
        </Link>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl animate-pulse"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="z-10 text-center max-w-lg mx-auto space-y-8 animate-fade-in-up">
        <div className="relative inline-block">
            <div className="absolute inset-0 bg-sky-500 blur-2xl opacity-20 rounded-full"></div>
            <div className="relative bg-slate-800/80 p-6 rounded-full border border-slate-700 shadow-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-sky-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                </svg>
            </div>
        </div>

        <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-white drop-shadow-sm">
                ขออภัยในความไม่สะดวก
            </h1>
            <div className="w-16 h-1 bg-sky-500 rounded-full mx-auto"></div>
            <p className="text-slate-300 text-lg leading-relaxed px-4">
                เพื่อให้ท่านได้รับข้อมูลที่ถูกต้องสมบูรณ์
                <span className="block my-2 sm:my-0 sm:inline"> ขณะนี้ระบบอยู่ระหว่างการปรับปรุง</span>
                <br className="hidden sm:block" />
                กรุณาลองใหม่อีกครั้งในภายหลัง
            </p>
        </div>

        <div className="pt-4 flex justify-center gap-2 text-sm text-slate-500 font-medium">
             <span className="animate-pulse">●</span> กำลังอัปเดตฐานข้อมูล
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default MaintenancePage;
