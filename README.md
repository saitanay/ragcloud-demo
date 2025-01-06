# MovieHub

MovieHub is a modern movie listing and recommendation web application built with
Next.js. It leverages RagCloud's powerful API to deliver intelligent search and
personalized movie recommendations, providing users with an enhanced browsing
experience on both web and mobile platforms.

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Populating the Database](#populating-the-database)
- [Implementing RagCloud](#implementing-ragcloud)
  - [Registering with RagCloud](#registering-with-ragcloud)
  - [Setting Up RagCloud Dataset](#setting-up-ragcloud-dataset)
  - [Generating RagCloud API Key](#generating-ragcloud-api-key)
  - [Pushing Data to RagCloud](#pushing-data-to-ragcloud)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Intelligent Search:** Users can search for movies using keywords with
  real-time suggestions powered by RagCloud.
- **Personalized Recommendations:** Get movie recommendations based on your
  viewing preferences.
- **Responsive Design:** Optimized for both web and mobile devices.
- **Loader Indicators:** Visual feedback during data fetching enhances user
  experience.
- **Detailed Movie Information:** Comprehensive details for each movie,
  including ratings, genre, and more.
- **Demo Code Boxes:** View the requests and responses sent to RagCloud for
  educational purposes.

## Screenshots

<!-- Placeholder for Home Page Screenshot -->

### Home Page

![Home Page](/public/home.png)

<!-- Placeholder for Search Page Screenshot -->

### Search Page

![Search Page](/public/search.png)

<!-- Placeholder for Movie Detail Page Screenshot -->

### Movie Detail Page

![Movie Detail Page](/public/movie-detail.png)

<!-- Placeholder for RagCloud Request/Response Screenshot -->

### RagCloud Integration

All pages show the requests and responses sent to RagCloud for educational
purposes.

![RagCloud Request and Response](/public/ragcloud-integration.png)

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- **Node.js** (v14 or later)
- **npm** or **Yarn**
- **MongoDB** Database
- **RagCloud API Key**
- **movies.movies.json** file (included in the repository)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/moviehub.git
   cd moviehub
   ```

2. **Install Dependencies**

   Using npm:

   ```bash
   npm install
   ```

   Or using Yarn:

   ```bash
   yarn install
   ```

### Configuration

1. **Environment Variables**

   Create a `.env.local` file in the root directory and add the following
   variables:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   RAGCLOUD_API_KEY=your_ragcloud_api_key
   RAGCLOUD_API_BASE_URL=https://ragcloud.io
   ```

   - **MONGODB_URI:** Your MongoDB connection string.
   - **RAGCLOUD_API_KEY:** Your RagCloud API key.
   - **RAGCLOUD_API_BASE_URL:** Base URL for RagCloud API (default is
     `https://ragcloud.io`).

2. **Next.js Configuration**

   Ensure your `next.config.js` allows images from external domains used for
   movie posters.

   ```javascript
   // next.config.js

   module.exports = {
   	images: {
   		domains: ["m.media-amazon.com"], // Add other domains as needed
   	},
   };
   ```

3. **Tailwind CSS Configuration**

   Ensure `tailwind.config.js` includes paths to your components and pages.

   ```javascript
   // tailwind.config.js

   module.exports = {
   	content: [
   		"./pages/**/*.{js,ts,jsx,tsx}",
   		"./components/**/*.{js,ts,jsx,tsx}",
   	],
   	theme: {
   		extend: {},
   	},
   	plugins: [],
   };
   ```

4. **Default Poster Image**

   Add a `default-poster.jpg` image in the `public` directory to serve as a
   fallback when a movie poster is unavailable.

### Populating the Database

1. **Using `movies.movies.json`**

   The repository includes a `movies.movies.json` file containing sample movie
   data. You can use this file to populate your MongoDB database.

2. **Importing Data into MongoDB**

   Use the following steps to import the JSON data into your MongoDB database:

   - **Install MongoDB Tools** (if not already installed):

     ```bash
     # For macOS using Homebrew
     brew tap mongodb/brew
     brew install mongodb-database-tools
     ```

   - **Import the JSON File:**

     ```bash
     mongoimport --uri "your_mongodb_connection_string" --collection movies --file path/to/movies.movies.json --jsonArray
     ```

     - Replace `"your_mongodb_connection_string"` with your actual MongoDB URI.
     - Ensure the `movies.movies.json` file is correctly formatted as a JSON
       array.

## Implementing RagCloud

RagCloud's API powers both the search and recommendation features of MovieHub.
Below is a guide on how to integrate RagCloud into your application.

### Registering with RagCloud

1. **Sign Up**

   - Visit [RagCloud](https://ragcloud.io/) and register for an account.

2. **Login to Admin Panel**

   - After registration, log in to the RagCloud admin panel at
     [https://ragcloud.io/admin](https://ragcloud.io/admin).

### Setting Up RagCloud Dataset

1. **Create a Dataset**

   - In the RagCloud admin panel, create a new dataset named **"Movies"**.

   <!-- Placeholder for Dataset Creation Screenshot -->

   ### Creating "Movies" Dataset

   ![Creating Movies Dataset](public/dataset.png)

### Generating RagCloud API Key

1. **Create an API Key**

   - In the RagCloud admin panel, navigate to the **API Keys** section.
   - Generate a new API key and note it down. This key will be used to
     authenticate API requests.

   <!-- Placeholder for API Key Generation Screenshot -->

   ### Generating API Key

   ![Generating API Key](public/api-key.png)

### Pushing Data to RagCloud

A one-time script is used to push data from MongoDB to RagCloud. Follow these
steps to execute the script.

1. **Ensure MongoDB is Populated**

   - Make sure your MongoDB database is populated with movie data, either by
     importing `movies.movies.json` or adding data manually.

2. **Create the Data Push Script**

   - Create a new script file named `pushDataToRagCloud.js` in the root
     directory.

   ```javascript
   // pushDataToRagCloud.js

   const axios = require("axios");
   const { MongoClient } = require("mongodb");
   require("dotenv").config();

   const uri = process.env.MONGODB_URI;
   const ragcloudApiKey = process.env.RAGCLOUD_API_KEY;
   const ragcloudBaseUrl =
   	process.env.RAGCLOUD_API_BASE_URL || "https://ragcloud.io";
   const datasetName = "Movies";

   const client = new MongoClient(uri, {
   	useNewUrlParser: true,
   	useUnifiedTopology: true,
   });

   async function pushData() {
   	try {
   		await client.connect();
   		const db = client.db("movies");
   		const movies = await db.collection("movies").find({}).toArray();

   		console.log(`Fetched ${movies.length} movies from MongoDB.`);

   		// Push each movie to RagCloud
   		for (const movie of movies) {
   			const payload = {
   				dataset: datasetName,
   				data: {
   					id: movie.id,
   					movie_name: movie.seriesTitle,
   					year: movie.releasedYear.toString(),
   					genre: Array.isArray(movie.genre)
   						? movie.genre.join(", ")
   						: movie.genre,
   					overview: movie.overview,
   					director: movie.director,
   					cast: Array.isArray(movie.stars)
   						? movie.stars.join(", ")
   						: movie.stars,
   				},
   			};

   			try {
   				const response = await axios.post(
   					`${ragcloudBaseUrl}/api/addDataRecord`,
   					payload,
   					{
   						headers: {
   							"Content-Type": "application/json",
   							Authorization: `Bearer ${ragcloudApiKey}`,
   						},
   					}
   				);

   				console.log(`Successfully added movie ID: ${movie.id}`);
   			} catch (err) {
   				console.error(
   					`Failed to add movie ID: ${movie.id}`,
   					err.response ? err.response.data : err.message
   				);
   			}
   		}

   		console.log("Data push to RagCloud completed.");
   	} catch (error) {
   		console.error("Error pushing data to RagCloud:", error.message);
   	} finally {
   		await client.close();
   	}
   }

   pushData();
   ```

   ### **Explanation of the Script**

   - **Dependencies:**

     - **axios:** For making HTTP requests to RagCloud API.
     - **mongodb:** For connecting to MongoDB and fetching movie data.
     - **dotenv:** To load environment variables from `.env.local`.

   - **Environment Variables:**

     - Ensure your `.env.local` file includes:
       ```env
       MONGODB_URI=your_mongodb_connection_string
       RAGCLOUD_API_KEY=your_ragcloud_api_key
       RAGCLOUD_API_BASE_URL=https://ragcloud.io
       ```

   - **Script Workflow:**
     1. **Connect to MongoDB:**
        - Connects to the MongoDB database using the provided URI.
     2. **Fetch Movies:**
        - Retrieves all movies from the `movies` collection.
     3. **Push Each Movie to RagCloud:**
        - Iterates through each movie and formats the payload as required by
          RagCloud's `/api/addDataRecord` endpoint.
        - Sends a POST request for each movie.
        - Logs success or failure for each movie.
     4. **Close MongoDB Connection:**
        - Ensures the database connection is closed after the operation.

3. **Install Dependencies**

   Ensure `axios`, `mongodb`, and `dotenv` are installed.

   ```bash
   npm install axios mongodb dotenv
   # or
   yarn add axios mongodb dotenv
   ```

4. **Run the Script**

   Execute the script using Node.js.

   ```bash
   node pushDataToRagCloud.js
   ```

   <!-- Placeholder for Data Push Script Execution Screenshot -->

   - **Note:** Ensure that your `.env.local` file includes the necessary
     environment variables as shown above.

5. **Verify Data in RagCloud**

   - Log in to the RagCloud admin panel to verify that the "Movies" dataset has
     been populated correctly.

   <!-- Placeholder for RagCloud Dataset Verification Screenshot -->

## Technologies Used

- **Next.js:** React framework for server-rendered applications.
- **React:** JavaScript library for building user interfaces.
- **MongoDB:** NoSQL database for storing movie data.
- **RagCloud API:** Provides intelligent search and recommendation
  functionalities.
- **Tailwind CSS:** Utility-first CSS framework for styling.
- **Axios:** Promise-based HTTP client for making API requests.

---
