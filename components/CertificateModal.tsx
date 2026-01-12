
import React, { useEffect, useCallback } from 'react';
import type { Certificate } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { PrintIcon } from './icons/PrintIcon';
import { CloseIcon } from './icons/CloseIcon';

interface CertificateModalProps {
  certificate: Certificate;
  onClose: () => void;
}

const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  // Helper to get high-res image URL
  const getHighResUrl = (url: string) => {
    // Replace any existing sz parameter or append a new one
    if (url.includes('sz=')) {
      return url.replace(/sz=[a-zA-Z0-9_-]+/, 'sz=w1600');
    }
    return `${url}&sz=w1600`;
  };

  const highResUrl = getHighResUrl(certificate.thumbnailUrl);
  // Print version needs to be very high quality
  const printUrl = highResUrl.replace('sz=w1600', 'sz=w2400');

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>พิมพ์เกียรติบัตร - ${certificate.name}</title>
            <style>
              @page { size: A4 landscape; margin: 0; }
              body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
              img { max-width: 100%; max-height: 100%; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="${printUrl}" onload="window.print(); setTimeout(() => window.close(), 500);" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4"
      aria-labelledby="certificate-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative bg-slate-800 rounded-xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden border border-slate-700 animate-fade-in-scale max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800 z-10">
          <h2 id="certificate-title" className="text-lg sm:text-xl font-bold text-white truncate pr-4">
            {certificate.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="ปิดหน้าต่าง"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow bg-slate-900/50 flex items-center justify-center p-4 overflow-auto">
          <img
            src={highResUrl}
            alt={`เกียรติบัตรของ ${certificate.name}`}
            className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded-sm"
          />
        </div>

        <div className="p-4 bg-slate-800 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-end gap-3 z-10">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700 hover:border-slate-500 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <PrintIcon className="w-5 h-5" />
            พิมพ์เกียรติบัตร
          </button>
          <a
            href={certificate.fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <DownloadIcon className="w-5 h-5" />
            ดาวน์โหลด
          </a>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale { animation: fade-in-scale 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default CertificateModal;
