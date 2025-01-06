// pages/movies/[id].js

import Head from 'next/head';
import SearchBar from '../../components/SearchBar';
import MovieCard from '../../components/MovieCard';
import axios from 'axios';
import Image from 'next/image';
import { ObjectId } from 'mongodb';
import clientPromise from '../../lib/mongodb'; // Ensure correct import path

const MovieDetail = ({ movie, similarMovies, error, requestPayload, responseData }) => {
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
            <p className="mb-2"><strong>IMDB Rating:</strong> {movie.imdbRating}</p>
            <p className="mb-2"><strong>Meta Score:</strong> {movie.metaScore}</p>
            <p className="mb-2"><strong>Director:</strong> {movie.director}</p>
            <p className="mb-2"><strong>Stars:</strong> {movie.stars.join(', ')}</p>
            <p className="mb-4"><strong>No of Votes:</strong> {movie.noOfVotes}</p>
            <p className="mb-4"><strong>Gross:</strong> {movie.gross}</p>
            <p className="mb-4"><strong>Overview:</strong> {movie.overview}</p>
          </div>
        </div>

        {/* Code Box: Request Sent to RagCloud */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">Request Sent to RagCloud</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm text-gray-800">
              {JSON.stringify(requestPayload, null, 2)}
            </code>
          </pre>
        </div>

        {/* Code Box: Response Received from RagCloud */}
        <div className="mt-4">
          <h2 className="text-2xl font-semibold mb-2">Response Received from RagCloud</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm text-gray-800">
              {JSON.stringify(responseData, null, 2)}
            </code>
          </pre>
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
    const db = client.db('movies'); // Ensure 'movies' is the correct DB name

    // Validate and convert the id to ObjectId
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return {
        props: { movie: null, similarMovies: [], error: 'Invalid movie ID.', requestPayload: null, responseData: null },
      };
    }

    // Fetch the movie details from MongoDB using _id
    const movie = await db.collection('movies').findOne({ _id: objectId });

    console.log('@@@Movie:', movie);

    if (!movie) {
      return {
        props: { movie: null, similarMovies: [], error: 'Movie not found.', requestPayload: null, responseData: null },
      };
    }

    // Prepare data for Local API
    const requestPayload = {
      dataset: 'Movies',
      data: [
        { movie_name: movie.seriesTitle, weight: 3 },
        { genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre, weight: 1 },
        { director: movie.director, weight: 2 },
        { cast: Array.isArray(movie.stars) ? movie.stars.join(', ') : movie.stars, weight: 1 },
      ],
      requestedCountOfMatches: 12,
      thresholdMatchScore: 0.5,
      pageNumber: 1,
      pageSize: 12,
    };

    console.log('@@@Local API Request Movie Data:', requestPayload);

    // Call Local API to get similar movies
    const ragcloudResponse = await axios.post(
      'http://localhost:3000/api/search', // Local API endpoint
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.RAGCLOUD_API_KEY, // Uncomment if required
        },
      }
    );

    console.log('@@@Local API Response:', ragcloudResponse.data);

    const responseData = ragcloudResponse.data;

    let similarMovies = [];

    if (ragcloudResponse.data.matchedRecordsWithScore) {
      const similarMovieIds = ragcloudResponse.data.matchedRecordsWithScore.map((result) => result.data.id);

      console.log('@@@Similar Movie IDs:', similarMovieIds);

      // Fetch similar movies from MongoDB using the 'id' field
      similarMovies = await db
        .collection('movies')
        .find({ id: { $in: similarMovieIds } })
        .toArray();

      console.log('@@@Similar Movies:', similarMovies);

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
        imdbRating: movie.imdbRating || 0,
        overview: movie.overview || 'No overview available.',
        metaScore: movie.metaScore || 0,
        director: movie.director || 'Unknown',
        stars: movie.stars || [],
        noOfVotes: movie.noOfVotes || 0,
        gross: movie.gross || 'N/A',
      }));
    }

    console.log('@@@Similar Movies 2:', similarMovies);

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
      imdbRating: movie.imdbRating || 0,
      overview: movie.overview || 'No overview available.',
      metaScore: movie.metaScore || 0,
      director: movie.director || 'Unknown',
      stars: movie.stars || [],
      noOfVotes: movie.noOfVotes || 0,
      gross: movie.gross || 'N/A',
    };

    console.log('@@@Serialized Movie:', serializedMovie);

    return {
      props: { movie: serializedMovie, similarMovies, error: null, requestPayload, responseData },
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
      props: { movie: null, similarMovies: [], error: errorMessage, requestPayload: null, responseData: null },
    };
  }
}
