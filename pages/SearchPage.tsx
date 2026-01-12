
import React, { useState } from 'react';
import SearchInput from '../components/SearchInput';
import CertificateCard from '../components/CertificateCard';
import CertificateModal from '../components/CertificateModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { fetchCertificates } from '../services/googleDrive';
import type { Certificate } from '../types';
import { SearchIcon } from '../components/icons/SearchIcon';
import LargeResultsWarning from '../components/LargeResultsWarning';

const LARGE_RESULT_THRESHOLD = 50;

// ปรับปรุงคำที่ห้ามค้นหา: ลบคำเฉพาะเจาะจงออก เพื่อให้ค้นหา "กาฬสินธุ์" ได้ตามความต้องการ
// เหลือไว้เฉพาะคำกลางๆ ที่อาจคืนค่าผลลัพธ์มหาศาลโดยไม่ตั้งใจ
const COMMON_TEMPLATE_KEYWORDS = [
  'โรงเรียน',
  'สพป',
  'สำนักงานเขตพื้นที่',
  'การศึกษาพิเศษ',
  'เกียรติบัตร',
  'มอบให้ไว้'
];

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;

    // Smart Validation: ตรวจสอบคำค้นหาที่เป็นคำทั่วไป
    if (COMMON_TEMPLATE_KEYWORDS.some(keyword => term === keyword)) {
        setError(`คำว่า "${term}" เป็นคำทั่วไปที่ปรากฏในเกียรติบัตรแทบทุกใบ\n\nกรุณาระบุคำค้นที่เฉพาะเจาะจงมากขึ้น เช่น "ชื่อ-นามสกุล", "ชื่อกิจกรรม" ครับ`);
        setResults([]);
        setHasSearched(false);
        return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setResults([]);

    try {
      const data = await fetchCertificates(term);
      setResults(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('เกิดข้อผิดพลาดในการค้นหา');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
  };

  const handleCloseModal = () => {
    setSelectedCertificate(null);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="py-20 animate-fade-in-up">
           <LoadingSpinner />
           <p className="text-center text-slate-400 mt-4 animate-pulse">กำลังค้นหาข้อความภายในไฟล์...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-10 animate-fade-in-up">
          <ErrorMessage message={error} />
        </div>
      );
    }

    if (!hasSearched) {
      return (
        <div className="mt-16 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full mb-8 ring-1 ring-slate-700 shadow-2xl shadow-sky-900/20 backdrop-blur-sm group">
            <SearchIcon className="h-16 w-16 text-sky-500/80 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">ระบบค้นหาเกียรติบัตรอัจฉริยะ</h3>
          <p className="text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
            ค้นหาด้วย <span className="text-sky-300 font-semibold">ชื่อ</span>, <span className="text-sky-300 font-semibold">นามสกุล</span>, <span className="text-sky-300 font-semibold">ชื่อโรงเรียน</span> หรือข้อความใดๆ
            <br />
            ระบบจะค้นหาข้อความจาก <span className="font-bold text-white">เนื้อหาภายในไฟล์เกียรติบัตร</span> โดยตรง
          </p>
        </div>
      );
    }

    if (results.length > 0) {
      return (
        <div className="space-y-6 animate-fade-in-up">
          {results.length > LARGE_RESULT_THRESHOLD && (
            <LargeResultsWarning searchTerm={searchTerm} count={results.length} />
          )}
          
          <div className="flex items-center justify-between text-slate-300 bg-slate-800/40 px-6 py-3 rounded-lg border border-slate-700/50">
            <span className="font-medium">ผลการค้นหาสำหรับ "{searchTerm}"</span>
            <span className="bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full text-sm font-bold border border-sky-500/30">
              พบ {results.length} รายการ
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {results.map((cert, index) => (
              <CertificateCard
                key={cert.id}
                certificate={cert}
                staggerDelay={index * 100}
                onCardClick={handleOpenModal}
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-20 text-center text-slate-400 animate-fade-in-up">
        <div className="inline-block p-6 bg-slate-800/50 rounded-full mb-6 ring-1 ring-slate-700">
          <SearchIcon className="h-12 w-12 text-slate-600" />
        </div>
        <p className="text-xl font-bold text-slate-300 mb-2">ไม่พบเกียรติบัตรที่ค้นหา</p>
        <p className="text-slate-500">
            ลองตรวจสอบคำค้น หรือใช้ข้อความอื่นที่ปรากฏในเกียรติบัตร
        </p>
      </div>
    );
  };

  return (
    <>
      <div className="container mx-auto max-w-6xl px-4 min-h-[80vh]">
        <div className="pt-8 pb-10 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-sky-500/20 blur-[100px] -z-10 rounded-full pointer-events-none"></div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 drop-shadow-lg leading-tight tracking-tight">
            ค้นหาเกียรติบัตร
            <span className="block text-2xl sm:text-3xl font-medium text-sky-400 mt-2">สำนักบริหารงานการศึกษาพิเศษ</span>
          </h1>
        </div>

        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative z-10">
             <div className="flex flex-col sm:flex-row gap-3 shadow-2xl shadow-black/30 rounded-2xl bg-slate-800/40 p-2 backdrop-blur-md border border-slate-700/50">
                <SearchInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="พิมพ์ชื่อ, นามสกุล หรือ โรงเรียน..."
                />
                <button 
                  type="submit"
                  disabled={!searchTerm.trim() || loading}
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 min-w-[140px]"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <SearchIcon className="w-5 h-5" />
                            <span>ค้นหา</span>
                        </>
                    )}
                </button>
             </div>
          </form>
          <div className="mt-4 flex justify-center gap-4 text-sm text-slate-400">
             <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> ค้นหาจากเนื้อหาในไฟล์</span>
             <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> รองรับชื่อบางส่วน</span>
             <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> ขับเคลื่อนโดย Google Drive</span>
          </div>
        </div>

        {renderContent()}
      </div>

      {selectedCertificate && (
        <CertificateModal certificate={selectedCertificate} onClose={handleCloseModal} />
      )}
      
      <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default SearchPage;
