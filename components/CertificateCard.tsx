
import React, { useState } from 'react';
import type { Certificate } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { Position } from '../types';
import { ImageIcon } from './icons/ImageIcon';

interface CertificateCardProps {
  certificate: Certificate;
  staggerDelay: number;
}

const positionColorMap: Record<Position, string> = {
  [Position.Teacher]: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  [Position.ViceDirector]: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  [Position.Director]: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate, staggerDelay }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-lg bg-slate-800/50 shadow-lg transition-all duration-300 hover:shadow-cyan-500/20 hover:scale-[1.03] border border-slate-700 hover:border-sky-500/50 card-animate"
      style={{ animationDelay: `${staggerDelay}ms`, opacity: 0 }}
    >
      <div className="w-full h-48 bg-slate-700/50">
        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
            <ImageIcon className="w-8 h-8 text-slate-500 mb-2" />
            <span className="text-xs text-slate-400">ไม่สามารถแสดงรูปภาพ</span>
            <span className="text-xs text-slate-500">โปรดตรวจสอบ permission</span>
          </div>
        ) : (
          <img
            src={certificate.thumbnailUrl}
            alt={`เกียรติบัตรของ ${certificate.name}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={handleImageError}
            loading="lazy"
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-lg font-bold text-white truncate" title={certificate.name}>
          {certificate.name}
        </h3>
        <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full border ${positionColorMap[certificate.position]}`}>
          {certificate.position}
        </span>
      </div>
      
      <a
        href={certificate.fileUrl}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 bg-slate-700/50 rounded-full text-slate-300 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-sky-500 hover:text-white hover:scale-110"
        aria-label="ดาวน์โหลด"
      >
        <DownloadIcon className="w-5 h-5" />
      </a>
    </div>
  );
};

export default CertificateCard;
