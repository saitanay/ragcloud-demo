// pages/index.js

import Head from 'next/head';
import clientPromise from '../lib/mongodb';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';

export default function Home({ movies }) {
  return (
    <div>
      <Head>
        <title>Movie Listing</title>
        <meta name="description" content="A movie listing website." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4 text-center">Movie Listing</h1>
        <SearchBar />
        {movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <p className="text-center mt-8">No movies available.</p>
        )}
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const client = await clientPromise;
    const db = client.db('movies'); // Updated to 'movies' database

    // Use aggregation with $sample to fetch random movies efficiently
    const movies = await db
      .collection('movies') // Updated to 'movies' collection
      .aggregate([{ $sample: { size: 12 } }])
      .toArray();

    // Serialize the movies: convert ObjectId to string and handle undefined fields
    const serializedMovies = movies.map((movie) => ({
      ...movie,
      _id: movie._id.toString(),
      posterLink: movie.posterLink || '/default-poster.jpg', // Provide a default poster if missing
      seriesTitle: movie.seriesTitle || 'Untitled',
      releasedYear: movie.releasedYear || 'Unknown',
      certificate: movie.certificate || 'Not Rated',
      runtime: movie.runtime || 0,
      genre: movie.genre || [],
      IMDB_Rating: movie.IMDB_Rating || 0,
      overview: movie.overview || 'No overview available.',
      metaScore: movie.metaScore || 0,
      director: movie.director || 'Unknown',
      stars: movie.stars || [],
      noOfVotes: movie.noOfVotes || 0,
      gross: movie.gross || 'N/A',
    }));

    return {
      props: { movies: serializedMovies },
    };
  } catch (e) {
    console.error(e);
    return {
      props: { movies: [] },
    };
  }
}
