
import React, { useState } from 'react';
import { SettingsIcon } from '../components/icons/SettingsIcon';
import { LockIcon } from '../components/icons/LockIcon';
import { updateMaintenanceStatus } from '../services/googleDrive';

interface AdminPageProps {
  isMaintenanceMode: boolean;
  setMaintenanceMode: (value: boolean) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ isMaintenanceMode, setMaintenanceMode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'ksp1234') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('รหัสผ่านไม่ถูกต้อง');
      setPassword('');
    }
  };

  const handleToggle = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    const newValue = !isMaintenanceMode;
    
    try {
      // 1. Update Server
      const success = await updateMaintenanceStatus(newValue);
      
      if (success) {
        // 2. Update Local State only if server update succeeded
        setMaintenanceMode(newValue);
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกสถานะ');
      }
    } catch (e) {
      console.error(e);
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 animate-fade-in-up">
        <div className="w-full max-w-md bg-slate-800/50 p-8 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-slate-700/50 rounded-full">
               <LockIcon className="w-8 h-8 text-sky-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-white mb-6">เข้าสู่ระบบผู้ดูแล</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                autoFocus
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-sky-500/20"
            >
              เข้าใช้งาน
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-sky-500/20 rounded-lg">
          <SettingsIcon className="w-8 h-8 text-sky-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">ตั้งค่าการใช้งาน</h1>
      </div>

      <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-white">สถานะการปิดปรับปรุง</h3>
            <p className="text-slate-400">เมื่อเปิดใช้งาน ผู้ใช้ทั่วไปจะเห็นหน้าแจ้งเตือนการปิดปรับปรุง</p>
          </div>
          
          <button
            onClick={handleToggle}
            disabled={isUpdating}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              isMaintenanceMode ? 'bg-sky-500' : 'bg-slate-600'
            } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
          >
            <span
              className={`${
                isMaintenanceMode ? 'translate-x-7' : 'translate-x-1'
              } inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-md`}
            />
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-700/50">
           <div className={`p-4 rounded-lg border ${isMaintenanceMode ? 'bg-sky-500/10 border-sky-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
              <div className="flex items-center gap-3">
                 <div className={`w-3 h-3 rounded-full ${isMaintenanceMode ? 'bg-sky-500 animate-pulse' : 'bg-green-500'}`}></div>
                 <span className={`font-medium ${isMaintenanceMode ? 'text-sky-300' : 'text-green-400'}`}>
                    สถานะปัจจุบัน: {isUpdating ? 'กำลังบันทึกข้อมูล...' : (isMaintenanceMode ? 'กำลังปิดปรับปรุง (มีผลกับทุกเครื่อง)' : 'ใช้งานปกติ (ออนไลน์)')}
                 </span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
