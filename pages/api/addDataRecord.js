// pages/api/addDataRecord.js

import clientPromise from '../../lib/mongodb';

/**
 * API Endpoint: /api/addDataRecord
 * Method: POST
 * Description: Adds a new movie record to the 'movies' collection.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const { seriesTitle, releasedYear, certificate, runtime, genre, IMDB_Rating, overview, metaScore, director, stars, noOfVotes, gross, posterLink } = req.body;

  // Basic validation
  if (!seriesTitle || !overview) {
    return res.status(400).json({ success: false, message: 'Missing required fields: seriesTitle or overview.' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('movies'); // Ensure you're using the 'movies' database

    const newMovie = {
      seriesTitle,
      releasedYear: releasedYear || 'Unknown',
      certificate: certificate || 'Not Rated',
      runtime: runtime || 0,
      genre: Array.isArray(genre) ? genre : [genre],
      IMDB_Rating: IMDB_Rating || 0,
      overview,
      metaScore: metaScore || 0,
      director: director || 'Unknown',
      stars: Array.isArray(stars) ? stars : [stars],
      noOfVotes: noOfVotes || 0,
      gross: gross || 'N/A',
      posterLink: posterLink || '/default-poster.jpg',
    };

    const result = await db.collection('movies').insertOne(newMovie);

    res.status(201).json({ success: true, movieId: result.insertedId.toString() });
  } catch (error) {
    console.error('Error in /api/addDataRecord:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
