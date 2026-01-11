import React, { useState } from 'react';
import SearchInput from '../components/SearchInput';
import CertificateCard from '../components/CertificateCard';
import CertificateModal from '../components/CertificateModal';
import { fetchCertificates } from '../services/googleDrive';
import type { Certificate } from '../types';
import { SearchIcon } from '../components/icons/SearchIcon';
import { WarningIcon } from '../components/icons/WarningIcon';

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
    };

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const searchResults = await fetchCertificates(searchTerm);
      setResults(searchResults);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('เกิดข้อผิดพลาดที่ไม่รู้จักระหว่างการค้นหา');
      }
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenModal = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
  };

  const handleCloseModal = () => {
    setSelectedCertificate(null);
  };


  const renderResults = () => {
    if (isLoading) {
      return (
         <div className="flex flex-col items-center justify-center text-center mt-16">
            <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-sky-400 mb-4"></div>
            <p className="text-lg text-slate-300">กำลังค้นหา...</p>
        </div>
      );
    }

    if (error) {
       return (
          <div className="mt-16 text-center text-amber-400">
            <div className="inline-block p-5 bg-slate-800/50 rounded-full mb-4">
               <WarningIcon className="h-12 w-12 text-amber-500"/>
            </div>
            <p className="text-xl font-semibold">เกิดข้อผิดพลาดในการค้นหา</p>
            <p className="text-slate-400">{error}</p>
          </div>
        )
    }

    if (hasSearched) {
      return results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((cert, index) => (
            <CertificateCard 
              key={cert.id} 
              certificate={cert} 
              staggerDelay={index * 50} 
              onCardClick={handleOpenModal}
            />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center text-slate-400">
          <div className="inline-block p-5 bg-slate-800/50 rounded-full mb-4">
             <SearchIcon className="h-12 w-12 text-slate-500"/>
          </div>
          <p className="text-xl font-semibold">ไม่พบผลการค้นหา</p>
          <p>กรุณาลองตรวจสอบการสะกดชื่ออีกครั้ง หรือใช้คำค้นหาอื่น</p>
        </div>
      );
    }

    return (
       <div className="mt-16 text-center text-slate-500">
           <div className="inline-block p-5 bg-slate-800/50 rounded-full mb-4">
             <SearchIcon className="h-12 w-12 text-slate-600"/>
          </div>
          <p className="text-xl">กรอกชื่อ-นามสกุลของคุณเพื่อค้นหาเกียรติบัตร</p>
          <p className="text-slate-400">ระบบจะค้นหาจากข้อมูลที่ปรากฏบนเอกสาร</p>
      </div>
    );
  };

  return (
    <>
      <div className="container mx-auto max-w-4xl text-center px-4">
        <div className="pt-8 pb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">ค้นหาเกียรติบัตร</h1>
          <p className="text-lg text-slate-300">กรอกชื่อ-นามสกุลที่ปรากฏบนเกียรติบัตรเพื่อค้นหา</p>
        </div>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12 flex gap-2">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="เช่น สมชาย ใจดี"
          />
          <button type="submit" disabled={isLoading} className="bg-sky-500 text-white font-semibold px-6 py-2 rounded-full hover:bg-sky-600 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center">
              {isLoading ? '...' : 'ค้นหา'}
          </button>
        </form>

        {renderResults()}
      </div>
      {selectedCertificate && (
        <CertificateModal certificate={selectedCertificate} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default SearchPage;
