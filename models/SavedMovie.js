const mongoose = require('mongoose');

const SavedMovieSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  tmdbId: { type: Number, required: true },
  title: { type: String, required: true },
  posterPath: { type: String },
  savedAt: { type: Date, default: Date.now }
});

// Add unique compound index to prevent duplicate saves
SavedMovieSchema.index({ userId: 1, tmdbId: 1 }, { unique: true });

module.exports = mongoose.model('SavedMovie', SavedMovieSchema); 