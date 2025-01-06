// components/MovieCard.js

import Link from 'next/link';
import Image from 'next/image';

const MovieCard = ({ movie }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-md">
      <Link href={`/movies/${movie._id}`}>
        <div className="cursor-pointer">
          <Image
            src={movie.posterLink || '/default-poster.jpg'}
            alt={movie.seriesTitle}
            width={200} // Reduced width
            height={300} // Adjusted height proportionally
            objectFit="cover"
            className="w-full max-w-[200px] h-auto transition-transform duration-300 ease-in-out transform hover:scale-105"
          />
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">{movie.seriesTitle}</h2>
            <p className="text-gray-600 text-sm">
              {movie.overview.length > 100 ? `${movie.overview.substring(0, 100)}...` : movie.overview}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;
