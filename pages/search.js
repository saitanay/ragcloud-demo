// pages/search.js

import Head from 'next/head';
import SearchBar from '../components/SearchBar';
import MovieCard from '../components/MovieCard';
import axios from 'axios';

const SearchResults = ({ movies, query, error }) => {
  return (
    <div>
      <Head>
        <title>Search Results for "{query}"</title>
        <meta name="description" content={`Search results for ${query}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4 text-center">Search Results</h1>
        <SearchBar />
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}
        {movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

export default SearchResults;

export async function getServerSideProps(context) {
  const { query } = context.query;

  if (!query) {
    return {
      props: { movies: [], query: '', error: null },
    };
  }

  try {
    // Dynamically import clientPromise to ensure it's only used server-side
    const { default: clientPromise } = await import('../lib/mongodb');
    const client = await clientPromise;
    const db = client.db('movies');

    // Prepare data for Local API
    const searchData = {
      dataset: 'Movies',
      data: [
        { keyword: query, weight: 1 },
      ],
      requestedCountOfMatches: 12,
      thresholdMatchScore: 0.5,
      pageNumber: 1,
      pageSize: 12,
    };

    // Call Local API to perform the search
    const ragcloudResponse = await axios.post(
      'http://localhost:3000/api/search',
      searchData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.RAGCLOUD_API_KEY, // Uncomment if required
        },
      }
    );

    console.log('@@@Local API Response:', ragcloudResponse.data);

    let movies = [];

    // Check if the API response contains matchedRecordsWithScore
    if (ragcloudResponse.data.matchedRecordsWithScore) {
      const similarMovieIds = ragcloudResponse.data.matchedRecordsWithScore.map(
        (result) => result.data.id
      );

      console.log('@@@Similar Movie IDs:', similarMovieIds);

      // Fetch similar movies from MongoDB using the 'id' field
      movies = await db
        .collection('movies')
        .find({ id: { $in: similarMovieIds } })
        .toArray();

      console.log('@@@Similar Movies:', movies);

      // Serialize movies
      movies = movies.map((movie) => ({
        ...movie,
        _id: movie._id.toString(),
        posterLink: movie.posterLink || '/default-poster.jpg',
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

      console.log('@@@Serialized Movies:', movies);
    }

    return {
      props: { movies, query, error: null },
    };
  } catch (e) {
    console.error('Error fetching search results:', e);

    let errorMessage = 'An unexpected error occurred.';
    if (e.response) {
      if (e.response.status === 401) {
        errorMessage = 'Unauthorized access to Local API. Please check your API implementation.';
      } else if (e.response.status === 404) {
        errorMessage = 'Local API endpoint not found.';
      } else {
        errorMessage = `Local API Error: ${e.response.statusText}`;
      }
    } else if (e.request) {
      errorMessage = 'No response received from Local API.';
    } else {
      errorMessage = e.message;
    }

    return {
      props: { movies: [], query, error: errorMessage },
    };
  }
}
