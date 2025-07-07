# Movie App Backend

This is the backend server for the Movie App that tracks trending movies based on user searches.

## Features

- Track movie searches from users
- Calculate trending scores based on search frequency and recency
- Provide trending movies API
- Provide most searched movies API

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `env.example` to `.env`
   - Add your MongoDB connection string to `MONGODB_URI`

3. **Start the server:**
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/track-search` - Track a movie search
- `GET /api/trending` - Get trending movies
- `GET /api/most-searched` - Get most searched movies
- `POST /api/update-trending-scores` - Update trending scores

## Database Schema

The Movie model tracks:
- TMDB movie ID
- Title, overview, poster path
- Search count and last searched date
- Trending score (calculated algorithm)

## Trending Algorithm

Trending scores are calculated based on:
- Number of searches
- Recency of searches (decays over time)
- Formula: `searchCount * 10 * timeDecay` 