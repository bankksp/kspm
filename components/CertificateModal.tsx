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
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>พิมพ์เกียรติบัตร - ${certificate.name}</title>
            <style>
              @page { size: A4 landscape; margin: 0; }
              body { margin: 0; text-align: center; }
              img { width: 100%; height: 100%; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="${certificate.thumbnailUrl.replace('sz=w512-h512', 'sz=w1920')}" onload="window.print(); window.close();" />
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      aria-labelledby="certificate-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl p-4 m-4 flex flex-col gap-4 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <header className="flex items-center justify-between">
          <h2 id="certificate-title" className="text-lg font-semibold text-white truncate pr-10">
            {certificate.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="ปิดหน้าต่าง"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-grow bg-slate-900/50 rounded-md overflow-hidden flex items-center justify-center p-2" style={{ minHeight: '50vh' }}>
          <img
            src={certificate.thumbnailUrl.replace('sz=w512-h512', 'sz=w1280')}
            alt={`ตัวอย่างเกียรติบัตรของ ${certificate.name}`}
            className="max-w-full max-h-[75vh] object-contain"
          />
        </div>

        <footer className="flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700 hover:border-slate-500 transition-colors"
          >
            <PrintIcon className="w-5 h-5" />
            พิมพ์
          </button>
          <a
            href={certificate.fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition-colors"
          >
            <DownloadIcon className="w-5 h-5" />
            ดาวน์โหลด
          </a>
        </footer>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale { animation: fade-in-scale 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default CertificateModal;
