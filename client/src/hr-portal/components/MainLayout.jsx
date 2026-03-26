import React from 'react';
import Footer from '../components/Footer.jsx';

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow text-[13px] sm:text-base">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
