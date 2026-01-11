import React, { useState, useMemo } from 'react';
import CertificateCard from '../components/CertificateCard';
import CertificateModal from '../components/CertificateModal';
import FilterPills from '../components/FilterPills';
import { POSITIONS } from '../constants';
import { Position } from '../types';
import type { Certificate } from '../types';
import { CertificateIcon } from '../components/icons/CertificateIcon';

interface BrowsePageProps {
  certificates: Certificate[];
}


const BrowsePage: React.FC<BrowsePageProps> = ({ certificates }) => {
  const [activeFilter, setActiveFilter] = useState<'ทั้งหมด' | Position>('ทั้งหมด');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);


  const handleFilterChange = (filter: 'ทั้งหมด' | Position) => {
    setActiveFilter(filter);
  };
  
  const handleOpenModal = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
  };

  const handleCloseModal = () => {
    setSelectedCertificate(null);
  };

  const positionCounts = useMemo(() => {
    const counts: Record<Position | 'ทั้งหมด', number> = {
      'ทั้งหมด': certificates.length,
      [Position.Teacher]: 0,
      [Position.ViceDirector]: 0,
      [Position.Director]: 0,
    };

    certificates.forEach(cert => {
      if (counts[cert.position] !== undefined) {
        counts[cert.position]++;
      }
    });

    return counts;
  }, [certificates]);

  const filteredCertificates = useMemo((): Certificate[] => {
    if (activeFilter === 'ทั้งหมด') {
      return certificates;
    }
    return certificates.filter(cert => cert.position === activeFilter);
  }, [activeFilter, certificates]);
  
  const filterOptions: ('ทั้งหมด' | Position)[] = ['ทั้งหมด', ...POSITIONS];

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="text-center pt-8 pb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">คลังเกียรติบัตรทั้งหมด</h1>
          <p className="text-lg text-slate-300">เลือกดูและกรองเกียรติบัตรตามตำแหน่ง ({certificates.length} รายการ)</p>
        </div>

        <FilterPills
          positions={filterOptions}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          counts={positionCounts}
        />

        {filteredCertificates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredCertificates.map((cert, index) => (
              <CertificateCard 
                key={cert.id} 
                certificate={cert} 
                staggerDelay={index * 30}
                onCardClick={handleOpenModal}
              />
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center text-slate-400">
              <div className="inline-block p-5 bg-slate-800/50 rounded-full mb-4">
                <CertificateIcon className="h-12 w-12 text-slate-500"/>
              </div>
              <p className="text-xl font-semibold">
                  {activeFilter === 'ทั้งหมด' 
                      ? 'ไม่พบเกียรติบัตรในระบบ' 
                      : `ไม่พบเกียรติบัตรสำหรับตำแหน่ง "${activeFilter}"`
                  }
              </p>
              <p className="text-slate-300 mt-1">
                  {activeFilter === 'ทั้งหมด'
                      ? 'โปรดตรวจสอบ Google Drive หรือติดต่อผู้ดูแลระบบ'
                      : 'ลองเลือกตำแหน่งอื่นเพื่อค้นหา'
                  }
              </p>
          </div>
        )}
      </div>
      {selectedCertificate && (
        <CertificateModal certificate={selectedCertificate} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default BrowsePage;
