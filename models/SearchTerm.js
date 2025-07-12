const mongoose = require('mongoose');

const searchTermSchema = new mongoose.Schema({
  term: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  searchCount: {
    type: Number,
    default: 1
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
searchTermSchema.index({ searchCount: -1 });
searchTermSchema.index({ trendingScore: -1 });
searchTermSchema.index({ lastSearched: -1 });

module.exports = mongoose.model('SearchTerm', searchTermSchema); 