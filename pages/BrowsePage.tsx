import React, { useState, useEffect, useRef, useCallback } from 'react';
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

const PAGE_LIMIT = 24;

const BrowsePage: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ทั้งหมด' | Position>('ทั้งหมด');
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const observer = useRef<IntersectionObserver>();

  const loadCertificates = useCallback(async (filter: Position | 'ทั้งหมด', isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);
  
    try {
      const currentOffset = isLoadMore ? offset : 0;
      const { certificates: newCerts, hasNextPage } = await fetchCertificates(undefined, PAGE_LIMIT, currentOffset, filter);
      
      setCertificates(prev => isLoadMore ? [...prev, ...newCerts] : newCerts);
      setOffset(currentOffset + newCerts.length);
      setHasMore(hasNextPage);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [offset]);

  const lastElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadCertificates(activeFilter, true);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, activeFilter, loadCertificates]);
  

  useEffect(() => {
    // Initial load
    setCertificates([]);
    setOffset(0);
    setHasMore(true);
    loadCertificates('ทั้งหมด');
  }, []);

  const handleFilterChange = (filter: 'ทั้งหมด' | Position) => {
    setActiveFilter(filter);
    setCertificates([]);
    setOffset(0);
    setHasMore(true);
    loadCertificates(filter, false);
  };
  
  const handleOpenModal = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
  };

  const handleCloseModal = () => {
    setSelectedCertificate(null);
  };

  const filterOptions: ('ทั้งหมด' | Position)[] = ['ทั้งหมด', ...POSITIONS];

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;
  if (error && certificates.length === 0) return <ErrorMessage message={error} />;

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
        />

        {certificates.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in-up">
              {certificates.map((cert, index) => (
                <CertificateCard 
                  key={`${cert.id}-${index}`} 
                  certificate={cert} 
                  staggerDelay={index % PAGE_LIMIT * 30}
                  onCardClick={handleOpenModal}
                />
              ))}
            </div>
            <div ref={lastElementRef} className="h-20 flex items-center justify-center col-span-full">
              {loadingMore && <LoadingSpinner size="small" message="กำลังโหลดเพิ่มเติม..."/>}
            </div>
             {!loadingMore && !hasMore && (
                <p className="text-center text-slate-500 py-8">... สิ้นสุดรายการ ...</p>
             )}
          </>
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