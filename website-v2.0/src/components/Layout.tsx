// Layout.tsx

import React, { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="mt-16 p-4">
        {/* Main content of your application */}
        {children}
      </main>
    </div>
  );
};

export default Layout;
