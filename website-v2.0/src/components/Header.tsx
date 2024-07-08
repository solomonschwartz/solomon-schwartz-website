import React from 'react';
import { Link } from 'react-router-dom';
import ssLogo from '../assets/SS.png';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 fixed top-0 left-0 right-0 z-10">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <img
                className="h-8 w-auto"
                src={ssLogo}
                alt="Your Company"
              />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/resume"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                >
                  CV
                </Link>
                <Link
                  to="/writing"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                >
                  Writing
                </Link>
                <Link
                  to="/portfolio"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                >
                  Portfolio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
