// pages/search-db.js

import Head from 'next/head';
import SearchBarDb from '../components/SearchBarDb';
import MovieCard from '../components/MovieCard';

const SearchDbResults = ({ movies, query, error }) => {
  return (
    <div>
      <Head>
        <title>Search Results for "{query}" (DB Search)</title>
        <meta name="description" content={`Search results for ${query} from local database`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4 text-center">Search Results (MongoDB)</h1>
        <SearchBarDb />

        {/* Display Error if any */}
        {error && (
          <p className="text-red-500 text-center mb-4 mt-4">{error}</p>
        )}

        {/* Display Search Results */}
        {movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <p className="text-center mt-8">No movies found matching your search.</p>
        )}
      </main>
    </div>
  );
};

export default SearchDbResults;

export async function getServerSideProps(context) {
  const { query } = context.query;

  if (!query) {
    return {
      props: { movies: [], query: '', error: null },
    };
  }

  try {
    const { default: clientPromise } = await import('../lib/mongodb');
    const client = await clientPromise;
    const db = client.db('movies');

    // Split the query into keywords
    const queryWords = query.split(/\s+/).filter((word) => word.trim() !== '');

    // Build regex match conditions for each keyword
    const regexConditions = queryWords.map((word) => ({
      $or: [
        { seriesTitle: { $regex: word, $options: 'i' } },
        { director: { $regex: word, $options: 'i' } },
        { stars: { $regex: word, $options: 'i' } },
        { overview: { $regex: word, $options: 'i' } },
      ],
    }));

    // Search pipeline
    const pipeline = [
      {
        $match: {
          $or: regexConditions, // Match any of the keywords in any field
        },
      },
      { $limit: 12 }, // Adjust limit as needed
    ];

    const results = await db.collection('movies').aggregate(pipeline).toArray();

    // Serialize _id for Next.js
    const movies = results.map((movie) => ({
      ...movie,
      _id: movie._id.toString(),
    }));

    return {
      props: { movies, query, error: null },
    };
  } catch (error) {
    console.error('Error fetching search results from MongoDB:', error);
    return {
      props: { movies: [], query, error: 'Failed to fetch search results from the database.' },
    };
  }
}
