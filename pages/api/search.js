// pages/api/search.js

import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * API Endpoint: /api/search
 * Method: POST
 * Description: Processes search requests to find similar movies based on the provided data.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const { dataset, data, requestedCountOfMatches, thresholdMatchScore, pageNumber, pageSize } = req.body;

  if (!dataset || !data || !Array.isArray(data)) {
    return res.status(400).json({ success: false, message: 'Invalid request payload.' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('movies'); // Ensure you're using the 'movies' database

    // Build aggregation pipeline
    const pipeline = [
      {
        $match: {
          // Initial match stage can be adjusted as needed
          // For example, match any movie that has at least one of the search parameters
          $or: [
            ...data
              .filter(item => item.movie_name)
              .map(item => ({ seriesTitle: { $regex: item.movie_name, $options: 'i' } })),
            ...data
              .filter(item => item.genre)
              .map(item => ({ genre: { $regex: item.genre, $options: 'i' } })),
            ...data
              .filter(item => item.director)
              .map(item => ({ director: { $regex: item.director, $options: 'i' } })),
            ...data
              .filter(item => item.cast)
              .map(item => ({ stars: { $regex: item.cast, $options: 'i' } })),
          ],
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              ...data.map(item => {
                if (item.movie_name) {
                  return {
                    $cond: [
                      { $regexMatch: { input: '$seriesTitle', regex: item.movie_name, options: 'i' } },
                      item.weight,
                      0,
                    ],
                  };
                }
                if (item.genre) {
                  return {
                    $cond: [
                      { $regexMatch: { input: '$genre', regex: item.genre, options: 'i' } },
                      item.weight,
                      0,
                    ],
                  };
                }
                if (item.director) {
                  return {
                    $cond: [
                      { $regexMatch: { input: '$director', regex: item.director, options: 'i' } },
                      item.weight,
                      0,
                    ],
                  };
                }
                if (item.cast) {
                  return {
                    $cond: [
                      { $regexMatch: { input: '$stars', regex: item.cast, options: 'i' } },
                      item.weight,
                      0,
                    ],
                  };
                }
                return 0;
              }),
            ],
          },
        },
      },
      {
        $match: {
          score: { $gte: thresholdMatchScore },
        },
      },
      {
        $sort: { score: -1 },
      },
      {
        $limit: requestedCountOfMatches,
      },
      {
        $project: { _id: 1 }, // Only return the _id field
      },
    ];

    const results = await db.collection('movies').aggregate(pipeline).toArray();

    // Serialize ObjectId to string
    const serializedResults = results.map((movie) => ({
      recordId: movie._id.toString(),
    }));

    res.status(200).json({ success: true, results: serializedResults });
  } catch (error) {
    console.error('Error in /api/search:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
