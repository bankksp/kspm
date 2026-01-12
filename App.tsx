
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import SearchPage from './pages/SearchPage';
import BrowsePage from './pages/BrowsePage';
import AdminPage from './pages/AdminPage';
import Footer from './components/Footer';
import MaintenancePage from './components/MaintenancePage';
import { fetchMaintenanceStatus } from './services/googleDrive';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  // Initialize with null to indicate "loading" state, or false as default
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Fetch Global Maintenance Status on Load
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const status = await fetchMaintenanceStatus();
        setIsMaintenanceMode(status);
      } catch (e) {
        console.error("Error checking maintenance mode", e);
      } finally {
        setIsLoadingStatus(false);
      }
    };
    checkMaintenance();
  }, []);

  // Show a simple loading screen while checking status to prevent flash
  if (isLoadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">
        <LoadingSpinner />
      </div>
    );
  }

  // If maintenance mode is active AND user is not on admin page, show Maintenance Screen
  if (isMaintenanceMode && !isAdminRoute) {
    return (
      <React.StrictMode>
        <MaintenancePage />
        {/* Hidden Admin Access Trigger for when stuck in maintenance mode */}
        <div className="fixed bottom-0 right-0 w-20 h-20 z-50" onClick={() => window.location.hash = '#/admin'}></div>
      </React.StrictMode>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-slate-100 font-sarabun">
      <Header />
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route 
            path="/admin" 
            element={
              <AdminPage 
                isMaintenanceMode={isMaintenanceMode} 
                setMaintenanceMode={setIsMaintenanceMode} 
              />
            } 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
