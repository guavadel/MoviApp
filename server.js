require('dotenv').config();
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
app.post('/api/track-popular', async (req, res) => {
  try {
    const { movieData } = req.body;
    const trackedMovie = await DatabaseService.trackPopularMovie(movieData);
    res.json({ success: true, movie: trackedMovie });
  } catch (error) {
    console.error('Error tracking popular movie:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Popular movies (first results only)
app.get('/api/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const popularMovies = await DatabaseService.getPopularMovies(parseInt(limit));
    res.json({ success: true, movies: popularMovies });
  } catch (error) {
    console.error('Error getting popular movies:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 