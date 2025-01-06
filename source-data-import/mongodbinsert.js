// importMovies.js

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { MongoClient } = require('mongodb');

// MongoDB connection details
const username = 'root';
const password = '????';
const host = '????';
const port = '5432';
const database = 'movies';
const authSource = 'admin';
const directConnection = 'true';

// Construct the MongoDB URI
const uri = `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${database}?directConnection=${directConnection}&authSource=${authSource}`;

// Name of the CSV file
const csvFilePath = path.join(__dirname, 'movies.csv');

// Function to parse numeric fields and remove commas
const parseNumber = (value) => {
  if (!value) return null;
  return Number(value.toString().replace(/,/g, ''));
};

// Function to parse runtime (e.g., "142 min" to 142)
const parseRuntime = (runtimeStr) => {
  if (!runtimeStr) return null;
  const match = runtimeStr.match(/(\d+)/);
  return match ? Number(match[1]) : null;
};

// Main function to import CSV to MongoDB
async function importCSVtoMongo() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected successfully to MongoDB');

    const db = client.db(database);
    const collection = db.collection('movies');

    const movies = [];

    // Read and parse the CSV file
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Construct the movie document
        const movie = {
          id: row['movie_id'],
          posterLink: row['Poster_Link'],
          seriesTitle: row['Series_Title'],
          releasedYear: parseNumber(row['Released_Year']),
          certificate: row['Certificate'],
          runtime: parseRuntime(row['Runtime']),
          genre: row['Genre'].split(',').map((g) => g.trim()),
          imdbRating: parseFloat(row['IMDB_Rating']),
          overview: row['Overview'],
          metaScore: parseNumber(row['Meta_score']),
          director: row['Director'],
          stars: [
            row['Star1'],
            row['Star2'],
            row['Star3'],
            row['Star4'],
          ].filter(Boolean),
          noOfVotes: parseNumber(row['No_of_Votes']),
          gross: parseNumber(row['Gross']),
        };

        movies.push(movie);
      })
      .on('end', async () => {
        console.log(`CSV file successfully processed. Number of records: ${movies.length}`);

        if (movies.length > 0) {
          // Insert all movies into the collection
          const result = await collection.insertMany(movies);
          console.log(`${result.insertedCount} records inserted into the 'movies' collection.`);
        } else {
          console.log('No records to insert.');
        }

        // Close the MongoDB connection
        await client.close();
        console.log('MongoDB connection closed.');
      })
      .on('error', (error) => {
        console.error('Error reading the CSV file:', error);
      });
  } catch (error) {
    console.error('An error occurred:', error);
    await client.close();
  }
}

// Execute the import function
importCSVtoMongo();
