// components/Layout.js

import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      {/* Optional: Add a Footer here if needed */}
    </div>
  );
};

export default Layout;
