
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SearchPage from './pages/SearchPage';
import BrowsePage from './pages/BrowsePage';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import Footer from './components/Footer';
import { fetchCertificates } from './services/googleDrive';
import type { Certificate } from './types';

const App: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCertificates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all certificates for the browse page
      const certs = await fetchCertificates();
      setCertificates(certs);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while fetching data.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);


  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center" style={{height: 'calc(100vh - 128px)'}}><LoadingSpinner /></div>;
    }
    if (error) {
      return <ErrorMessage message={error} />;
    }
    return (
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/browse" element={<BrowsePage certificates={certificates} />} />
      </Routes>
    );
  };


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-slate-100">
      <Header />
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;