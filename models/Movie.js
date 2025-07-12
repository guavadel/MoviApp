const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  overview: String,
  posterPath: String,
  releaseDate: Date,
  voteAverage: Number,
  voteCount: Number,
  searchCount: {
    type: Number,
    default: 0
  },
  lastSearched: {
    type: Date,
    default: Date.now
  },
  trendingScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
movieSchema.index({ searchCount: -1 });
movieSchema.index({ trendingScore: -1 });
movieSchema.index({ lastSearched: -1 });

module.exports = mongoose.model('Movie', movieSchema); 