// uploadToRagCloud.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');

// ==========================
// Configuration Constants
// ==========================

// Maximum number of entries to process and upload
const MAX_ENTRIES = 1000; // Set this to the desired maximum number of records

// RagCloud API details
const API_ENDPOINT = 'https://ragcloud.io/api/addDataRecord'; // Corrected endpoint


const API_KEY = process.env.RAGCLOUD_API_KEY || 'JVF5OvTbluQVdyJAT3EsbyDSk0vIMJNU';
const DATASET_NAME = 'Movies Implementation 2';

// Path to the CSV file
const csvFilePath = path.join(__dirname, 'movies.csv');

// ==========================
// Helper Functions
// ==========================

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

// Function to generate a unique ID for each record
const generateRecordId = (releasedYear, seriesTitle) => {
  const sanitizedTitle = seriesTitle.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '');
  return `mo-${releasedYear}-${sanitizedTitle}`;
};

// Function to upload a single record to RagCloud
const uploadRecord = async (record) => {
  try {
    const payload = {
      dataset: DATASET_NAME,
      data: {
        id: record.movie_id,
        movie_name: record.Series_Title,
        year: record.Released_Year.toString(),
        genre: record.Genre,
        overview: record.Overview,
        director: record.Director,
        cast: [record.Star1, record.Star2, record.Star3, record.Star4].filter(Boolean).join(', '),
      },
    };

    console.log(`Uploading record: ${payload.data.movie_name} (ID: ${payload.data.id})`);
    // console.log('Payload:', payload);

    const response = await axios.post(API_ENDPOINT, payload, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    //Check if the upload was successful using http status code 20x
    if (response.status >= 200 && response.status < 300) {
      console.log(`✅ Successfully uploaded record: ${payload.data.movie_name} (ID: ${payload.data.id})`);
    }
    else {
      console.error(`❌ Failed to upload record: ${payload.data.movie_name}. Message: ${response.data.message}`);
    }
  } catch (error) {
    if (error.response) {
      console.error(`❌ Error uploading record: ${record.Series_Title}. Full Response:`, error.response.data);
    } else {
      console.error(`❌ Error uploading record: ${record.Series_Title}.`, error.message);
    }
  }
};

// ==========================
// Main Processing Function
// ==========================

const processCSV = async () => {
  const readStream = fs.createReadStream(csvFilePath).pipe(csv());
  let processedCount = 0;

  try {
    for await (const row of readStream) {
      if (processedCount >= MAX_ENTRIES) {
        console.log(`🚫 Reached the maximum limit of ${MAX_ENTRIES} entries. Stopping further processing.`);
        break;
      }

      // Upload the current record
      await uploadRecord(row);
      processedCount += 1;
    }

    console.log('📂 CSV file has been fully processed.');
    console.log(`📤 Total records uploaded: ${processedCount}`);
  } catch (error) {
    console.error('❌ An unexpected error occurred during CSV processing:', error);
  }
};

// Execute the main function
processCSV();
