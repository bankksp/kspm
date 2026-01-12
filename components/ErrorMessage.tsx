
import React from 'react';
import { WarningIcon } from './icons/WarningIcon';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center text-amber-400 bg-amber-900/20 p-8 rounded-lg border border-amber-500/20">
      <WarningIcon className="w-16 h-16" />
      <h2 className="text-2xl font-bold">คำแนะนำ</h2>
      <p className="text-slate-300 whitespace-pre-line leading-relaxed text-lg">{message}</p>
    </div>
  );
};

export default ErrorMessage;
