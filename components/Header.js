// components/Header.js

import Link from 'next/link';
import { useRouter } from 'next/router';
import SearchBar from './SearchBar';

const Header = () => {
  const router = useRouter();

  return (
    <header className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
        <div className="flex items-center space-x-4">
          <Link legacyBehavior href="/">
            <a className="text-2xl font-bold">MovieHub</a>
          </Link>
          <nav className="hidden md:flex space-x-4">
            <Link legacyBehavior href="/">
              <a className={`hover:text-gray-400 ${router.pathname === '/' ? 'text-gray-400' : ''}`}>Home</a>
            </Link>
            <Link legacyBehavior href="/search">
              <a className={`hover:text-gray-400 ${router.pathname === '/search' ? 'text-gray-400' : ''}`}>Search (RagCloud)</a>
            </Link>
            <Link legacyBehavior href="/search-db">
              <a className={`hover:text-gray-400 ${router.pathname === '/search' ? 'text-gray-400' : ''}`}>Search (Database)</a>
            </Link>
          </nav>
        </div>
        <a
          href="https://github.com/saitanay/ragcloud-demo" // Replace with your actual source code URL
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition text-md font-semibold inline-block mx-2"
        >
          View Source Code
        </a>
        <a
          href="https://www.kaggle.com/datasets/harshitshankhdhar/imdb-dataset-of-top-1000-movies-and-tv-shows" // Replace with your actual source code URL
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition text-md font-semibold inline-block mx-2"
        >
          Kaggle Data Set
        </a>


      </div>
    </header >
  );
};

export default Header;
