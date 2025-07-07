require('dotenv').config();
console.log('MONGODB_URI:', process.env.MONGODB_URI);
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const DatabaseService = require('./services/databaseService');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/track-search', async (req, res) => {
  try {
    const { movieData } = req.body;
    const trackedMovie = await DatabaseService.trackMovieSearch(movieData);
    res.json({ success: true, movie: trackedMovie });
  } catch (error) {
    console.error('Error tracking search:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const trendingMovies = await DatabaseService.getTrendingMovies(parseInt(limit));
    res.json({ success: true, movies: trendingMovies });
  } catch (error) {
    console.error('Error getting trending movies:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/most-searched', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const mostSearchedMovies = await DatabaseService.getMostSearchedMovies(parseInt(limit));
    res.json({ success: true, movies: mostSearchedMovies });
  } catch (error) {
    console.error('Error getting most searched movies:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/update-trending-scores', async (req, res) => {
  try {
    await DatabaseService.updateTrendingScores();
    res.json({ success: true, message: 'Trending scores updated' });
  } catch (error) {
    console.error('Error updating trending scores:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 