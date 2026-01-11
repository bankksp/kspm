
import React from 'react';
import { WarningIcon } from './icons/WarningIcon';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center text-amber-400 bg-amber-900/20 p-8 rounded-lg">
      <WarningIcon className="w-16 h-16" />
      <h2 className="text-2xl font-bold">เกิดข้อผิดพลาด</h2>
      <p className="text-slate-300">{message}</p>
      <p className="text-sm text-slate-400 mt-4">
        กรุณาตรวจสอบว่าคุณได้ตั้งค่า Google Apps Script URL ในโค้ดอย่างถูกต้อง
        <br />
        และตรวจสอบว่าโฟลเดอร์ใน Google Drive ถูกตั้งค่าเป็นสาธารณะ (Anyone with the link can view)
      </p>
    </div>
  );
};

export default ErrorMessage;
