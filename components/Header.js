// components/Header.js

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SearchBar from './SearchBar';

const Header = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="bg-gray-800 text-white">
      {/* Top bar with brand, "RagCloud.io Demo" label, and the hamburger icon */}
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Left side: MovieHub Logo */}
        <div className="flex items-center space-x-4">
          <Link legacyBehavior href="/">
            <a className="text-2xl font-bold">MovieHub</a>
          </Link>
        </div>

        {/* Center: RagCloud.io demo label */}
        <div className="hidden sm:block text-sm">
          <span className="mr-1 text-gray-300">This is a demo of</span>
          <a
            href="https://ragcloud.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300"
          >
            RagCloud.io
          </a>
        </div>

        {/* Right side: Hamburger icon (mobile) */}
        <button
          className="sm:hidden text-gray-300 hover:text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          {/* Simple 'Hamburger' icon */}
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            {isOpen ? (
              // X icon
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.225 4.811a1 1 0 011.414 0L12 9.172l4.361-4.361a1 1 0 011.414 1.414L13.414 10.586l4.361 4.361a1 1 0 01-1.414 1.414L12 12l-4.361 4.361a1 1 0 01-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 010-1.414z"
              />
            ) : (
              // Hamburger icon
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4 5h16a1 1 0 100-2H4a1 1 0 000 2zm16 7H4a1 1 0 100 2h16a1 1 0 100-2zm0 7H4a1 1 0 100 2h16a1 1 0 100-2z"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation and buttons - show/hide in mobile */}
      <div
        className={`sm:flex sm:items-center sm:justify-between sm:px-4 pb-4 sm:pb-0 transition-all duration-300 ${isOpen ? 'block' : 'hidden'
          }`}
      >
        {/* Nav links */}
        <nav className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 px-4">
          <Link legacyBehavior href="/">
            <a
              className={`hover:text-gray-400 ${router.pathname === '/' ? 'text-gray-400' : ''
                }`}
            >
              Home
            </a>
          </Link>
          <Link legacyBehavior href="/search">
            <a
              className={`hover:text-gray-400 ${router.pathname === '/search' ? 'text-gray-400' : ''
                }`}
            >
              Search (RagCloud)
            </a>
          </Link>
          <Link legacyBehavior href="/search-db">
            <a
              className={`hover:text-gray-400 ${router.pathname === '/search-db' ? 'text-gray-400' : ''
                }`}
            >
              Search (Database)
            </a>
          </Link>
        </nav>

        {/* Buttons */}
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-start sm:items-center px-4 space-y-2 sm:space-y-0 sm:space-x-2">
          <a
            href="https://github.com/saitanay/ragcloud-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-md font-semibold inline-block"
          >
            View Source Code
          </a>
          <a
            href="https://www.kaggle.com/datasets/harshitshankhdhar/imdb-dataset-of-top-1000-movies-and-tv-shows"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-md font-semibold inline-block"
          >
            Kaggle Data Set
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
