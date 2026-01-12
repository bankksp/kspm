
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SearchPage from './pages/SearchPage';
import BrowsePage from './pages/BrowsePage';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-slate-100 font-sarabun">
      <Header />
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/browse" element={<BrowsePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
