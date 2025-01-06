// pages/search.js

import Head from 'next/head';
import clientPromise from '../lib/mongodb';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import axios from 'axios';
import { ObjectId } from 'mongodb';

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
    const client = await clientPromise;
    const db = client.db('movies'); // Updated to 'movies' database

    // Prepare data for Local API
    const searchData = {
      dataset: 'Movies',
      data: [
        { movie_name: query, weight: 3 },
        { genre: query, weight: 1 },
        { director: query, weight: 2 },
        { cast: query, weight: 1 },
      ],
      requestedCountOfMatches: 12,
      thresholdMatchScore: 0.5,
      pageNumber: 1,
      pageSize: 12,
    };

    // Log the request payload and headers for debugging
    console.log('Local API Search Request Payload:', searchData);

    // Call Local API to perform the search
    const ragcloudResponse = await axios.post(
      'http://localhost:3000/api/search', // Updated to local API endpoint
      searchData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.RAGCLOUD_API_KEY,
        },
      }
    );

    let movies = [];

    if (ragcloudResponse.data.success && ragcloudResponse.data.results) {
      const movieIds = ragcloudResponse.data.results.map((result) => result.recordId);

      // Convert string IDs to ObjectId
      const objectSimilarIds = movieIds
        .map((id) => {
          try {
            return new ObjectId(id);
          } catch (error) {
            console.warn(`Invalid movie ID: ${id}`);
            return null;
          }
        })
        .filter(Boolean); // Remove nulls

      // Fetch movies from MongoDB using the IDs
      movies = await db
        .collection('movies')
        .find({ _id: { $in: objectSimilarIds } })
        .toArray();

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
