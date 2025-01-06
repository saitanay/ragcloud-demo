// pages/movies/[id].js

import Head from 'next/head';
import clientPromise from '../../lib/mongodb';
import SearchBar from '../../components/SearchBar';
import MovieCard from '../../components/MovieCard';
import axios from 'axios';
import Image from 'next/image';
import { ObjectId } from 'mongodb';

const MovieDetail = ({ movie, similarMovies, error }) => {
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Movie not found.</p>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>{movie.seriesTitle} - Movie Details</title>
        <meta name="description" content={movie.overview} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <SearchBar />
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3">
            <Image
              src={movie.posterLink || '/default-poster.jpg'}
              alt={movie.seriesTitle}
              width={300}
              height={450}
              objectFit="cover"
              className="rounded-lg shadow-md"
            />
          </div>
          <div className="md:w-2/3 md:pl-8">
            <h1 className="text-3xl font-bold mb-4">{movie.seriesTitle}</h1>
            <p className="mb-2"><strong>Released Year:</strong> {movie.releasedYear}</p>
            <p className="mb-2"><strong>Certificate:</strong> {movie.certificate}</p>
            <p className="mb-2"><strong>Runtime:</strong> {movie.runtime} minutes</p>
            <p className="mb-2"><strong>Genre:</strong> {movie.genre.join(', ')}</p>
            <p className="mb-2"><strong>IMDB Rating:</strong> {movie.IMDB_Rating}</p>
            <p className="mb-2"><strong>Meta Score:</strong> {movie.metaScore}</p>
            <p className="mb-2"><strong>Director:</strong> {movie.director}</p>
            <p className="mb-2"><strong>Stars:</strong> {movie.stars.join(', ')}</p>
            <p className="mb-4"><strong>No of Votes:</strong> {movie.noOfVotes}</p>
            <p className="mb-4"><strong>Gross:</strong> {movie.gross}</p>
            <p className="mb-4"><strong>Overview:</strong> {movie.overview}</p>
          </div>
        </div>

        {/* Similar Movies Section */}
        {similarMovies.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Similar Movies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarMovies.map((similarMovie) => (
                <MovieCard key={similarMovie._id} movie={similarMovie} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MovieDetail;

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const client = await clientPromise;
    const db = client.db('movies'); // Updated to 'movies' database

    // Validate and convert the id to ObjectId
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return {
        props: { movie: null, similarMovies: [], error: 'Invalid movie ID.' },
      };
    }

    // Fetch the movie details from MongoDB
    const movie = await db.collection('movies').findOne({ _id: objectId });

    console.log('@@@Movie:', movie);

    if (!movie) {
      return {
        props: { movie: null, similarMovies: [], error: 'Movie not found.' },
      };
    }

    // Prepare data for Local API
    const movieData = {
      "title": movie.seriesTitle,
      "overview": movie.overview,
      "genre": Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre,
      "director": movie.director,
      "stars": Array.isArray(movie.stars) ? movie.stars.join(', ') : movie.stars,
    };

    console.log('@@@Local API Request Movie Data:', movieData)

    // Log the request payload and headers for debugging
    console.log('@@@Local API Request Payload:', {
      dataset: 'Movies',
      data: [
        { "movie_name": movieData.title, weight: 3 },
        { "genre": movieData.genre, weight: 1 },
        { "director": movieData.director, weight: 2 },
        { "cast": movieData.stars, weight: 1 },
      ],
      requestedCountOfMatches: 12,
      thresholdMatchScore: 0.5,
      pageNumber: 1,
      pageSize: 12,
    });

    // Call Local API to get similar movies
    const ragcloudResponse = await axios.post(
      'http://localhost:3000/api/search', // Updated to local API endpoint
      {
        dataset: 'Movies',
        data: [
          { "movie_name": movieData.title, weight: 3 },
          { "genre": movieData.genre, weight: 1 },
          { "director": movieData.director, weight: 2 },
          { "cast": movieData.stars, weight: 1 },
        ],
        requestedCountOfMatches: 12,
        thresholdMatchScore: 0.5,
        pageNumber: 1,
        pageSize: 12,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.RAGCLOUD_API_KEY,
        },
      }
    );

    console.log('@@@Local API Response:', ragcloudResponse.data);

    let similarMovies = [];

    if (ragcloudResponse.data.success && ragcloudResponse.data.results) {
      const similarMovieIds = ragcloudResponse.data.results.map((result) => result.recordId);

      // Convert string IDs to ObjectId
      const objectSimilarIds = similarMovieIds
        .map((id) => {
          try {
            return new ObjectId(id);
          } catch (error) {
            console.warn(`Invalid similar movie ID: ${id}`);
            return null;
          }
        })
        .filter(Boolean); // Remove nulls

      // Fetch similar movies from MongoDB using their IDs
      similarMovies = await db
        .collection('movies')
        .find({ _id: { $in: objectSimilarIds } })
        .toArray();

      // Serialize similarMovies
      similarMovies = similarMovies.map((movie) => ({
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

    // Serialize the main movie
    const serializedMovie = {
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
    };

    return {
      props: { movie: serializedMovie, similarMovies, error: null },
    };
  } catch (e) {
    console.error('Error fetching movie details:', e);

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
      props: { movie: null, similarMovies: [], error: errorMessage },
    };
  }
}
