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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Routes
app.post('/api/track-search-term', async (req, res) => {
  try {
    const { searchTerm } = req.body;
    if (!searchTerm) {
      return res.status(400).json({ success: false, error: 'Search term is required' });
    }
    const trackedTerm = await DatabaseService.trackSearchTerm(searchTerm);
    res.json({ success: true, term: trackedTerm });
  } catch (error) {
    console.error('Error tracking search term:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trending search terms with exponential decay
app.get('/api/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const trendingTerms = await DatabaseService.getTrendingSearchTerms(parseInt(limit));
    res.json({ success: true, terms: trendingTerms });
  } catch (error) {
    console.error('Error getting trending search terms:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Most searched terms
app.get('/api/most-searched', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const mostSearchedTerms = await DatabaseService.getMostSearchedTerms(parseInt(limit));
    res.json({ success: true, terms: mostSearchedTerms });
  } catch (error) {
    console.error('Error getting most searched terms:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 