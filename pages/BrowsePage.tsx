
import React, { useState, useMemo, useEffect } from 'react';
import CertificateCard from '../components/CertificateCard';
import CertificateModal from '../components/CertificateModal';
import FilterPills from '../components/FilterPills';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { fetchCertificates } from '../services/googleDrive';
import { POSITIONS } from '../constants';
import { Position } from '../types';
import type { Certificate } from '../types';
import { CertificateIcon } from '../components/icons/CertificateIcon';

const BrowsePage: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ทั้งหมด' | Position>('ทั้งหมด');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    const loadAllCertificates = async () => {
      try {
        setLoading(true);
        // Fetch without query to get all
        const data = await fetchCertificates();
        setCertificates(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        }
      } finally {
        setLoading(false);
      }
    };

    loadAllCertificates();
  }, []);

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

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;
  if (error) return <ErrorMessage message={error} />;

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="text-center pt-8 pb-10">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3">คลังเกียรติบัตรทั้งหมด</h1>
          <p className="text-lg text-slate-300">
            รวบรวมเกียรติบัตรทั้งหมดของสำนักบริหารงานการศึกษาพิเศษ
          </p>
        </div>

        <FilterPills
          positions={filterOptions}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          counts={positionCounts}
        />

        {filteredCertificates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in-up">
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
          <div className="mt-16 text-center text-slate-400 animate-fade-in-up">
              <div className="inline-block p-5 bg-slate-800/50 rounded-full mb-4">
                <CertificateIcon className="h-12 w-12 text-slate-500"/>
              </div>
              <p className="text-xl font-semibold">
                  {activeFilter === 'ทั้งหมด' 
                      ? 'ไม่พบเกียรติบัตรในระบบ' 
                      : `ไม่พบเกียรติบัตรสำหรับตำแหน่ง "${activeFilter}"`
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
