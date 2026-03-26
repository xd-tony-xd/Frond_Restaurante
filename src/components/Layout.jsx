import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Puedes agregar un Header global aquí si quieres */}
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;