
import React from 'react';
import { NavLink } from 'react-router-dom';
import { SearchIcon } from './icons/SearchIcon';
import { GridIcon } from './icons/GridIcon';
import SchoolLogo from './SchoolLogo';

const Header: React.FC = () => {
  const activeLinkClass = 'bg-sky-500 text-white';
  const inactiveLinkClass = 'text-slate-300 hover:bg-slate-700 hover:text-white';
  const linkBaseClass = 'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200';

  return (
    <header className="bg-slate-900/50 backdrop-blur-lg sticky top-0 z-10 shadow-lg shadow-black/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <SchoolLogo className="h-14 w-14" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-white leading-tight">ระบบค้นหาเกียรติบัตร</span>
              <span className="text-sm text-slate-300 leading-tight">สำนักบริหารงานการศึกษาพิเศษ</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
            >
              <SearchIcon className="h-5 w-5" />
              ค้นหาเกียรติบัตร
            </NavLink>
            <NavLink
              to="/browse"
              className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
            >
              <GridIcon className="h-5 w-5" />
              ดูทั้งหมด
            </NavLink>
          </nav>
        </div>
      </div>
       {/* Mobile Navigation */}
      <nav className="md:hidden flex justify-around p-2 bg-slate-800/70">
         <NavLink
            to="/"
            className={({ isActive }) => `flex-1 text-center ${linkBaseClass} justify-center ${isActive ? activeLinkClass : inactiveLinkClass}`}
          >
            <SearchIcon className="h-5 w-5" />
            <span>ค้นหา</span>
          </NavLink>
          <NavLink
            to="/browse"
            className={({ isActive }) => `flex-1 text-center ${linkBaseClass} justify-center ${isActive ? activeLinkClass : inactiveLinkClass}`}
          >
            <GridIcon className="h-5 w-5" />
            <span>ทั้งหมด</span>
          </NavLink>
      </nav>
    </header>
  );
};

export default Header;
