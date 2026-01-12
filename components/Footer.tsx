
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LockIcon } from './icons/LockIcon';

const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center p-6 mt-auto bg-slate-900/30 relative">
      <div className="text-xs text-slate-500 space-y-1">
        <p>พัฒนาโดย ครูนันทพัทธ์ แสงสุดตา | โรงเรียนกาฬสินธุ์ปัญญานุกูล</p>
        <p>© 2025 D-school Smart Management Platform</p>
      </div>
      
      {/* Admin Entry - Enhanced Visibility */}
      <div className="absolute right-4 bottom-4 z-10">
         <NavLink 
           to="/admin" 
           className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 text-slate-400 hover:text-sky-400 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all duration-300 group" 
           title="สำหรับผู้ดูแลระบบ"
         >
           <LockIcon className="w-3 h-3 group-hover:scale-110 transition-transform" />
           <span className="text-xs font-medium">Admin</span>
         </NavLink>
      </div>
    </footer>
  );
};

export default Footer;
