// components/MovieCard.js

import Link from 'next/link';
import Image from 'next/image';

const MovieCard = ({ movie }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <Link href={`/movies/${movie._id}`} legacyBehavior>
        <a className="block">
          <div className="flex justify-center p-4">
            <Image
              src={movie.posterLink || '/default-poster.jpg'}
              alt={movie.seriesTitle}
              width={200}
              height={300}
              objectFit="cover"
              className="max-w-[120px] h-auto mx-auto transition-transform duration-300 ease-in-out transform hover:scale-105"
            />
          </div>
          <div className="p-4 text-center">
            <h2 className="text-xl font-semibold mb-2">{movie.seriesTitle}</h2>
            <p className="text-gray-600 text-sm">
              {movie.overview.length > 150 ? `${movie.overview.substring(0, 150)}...` : movie.overview}
            </p>
          </div>
        </a>
      </Link>
    </div>
  );
};

export default MovieCard;
