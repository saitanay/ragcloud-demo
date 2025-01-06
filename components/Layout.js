// components/Layout.js

import Header from './Header';
import Footer from './Footer'; // Ensure Footer.js exists if you want to include it

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      {/* <Footer /> Uncomment if Footer.js is created */}
    </div>
  );
};

export default Layout;
