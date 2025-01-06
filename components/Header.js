// components/Header.js

import Link from 'next/link';
import { useRouter } from 'next/router';

const Header = () => {
  const router = useRouter();

  return (
    <header className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center space-x-4">
          <Link legacyBehavior href="/">
            <a className="text-2xl font-bold">MovieHub</a>
          </Link>
          <nav className="hidden md:flex space-x-4">
            <Link legacyBehavior href="/">
              <a className={`hover:text-gray-400 ${router.pathname === '/' ? 'text-gray-400' : ''}`}>Home</a>
            </Link>
            <Link legacyBehavior href="/search">
              <a className={`hover:text-gray-400 ${router.pathname === '/search' ? 'text-gray-400' : ''}`}>Search</a>
            </Link>
          </nav>
        </div>
        {/* Mobile Menu Toggle can be added here if needed */}
      </div>
    </header>
  );
};

export default Header;
