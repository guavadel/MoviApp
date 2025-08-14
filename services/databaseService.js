const Movie = require('../models/Movie');
const SavedMovie = require('../models/SavedMovie');

class DatabaseService {
  // Track popular movie (first result only)
  static async trackPopularMovie(movieData) {
    try {
      const { id, title, overview, poster_path, release_date, vote_average, vote_count } = movieData;
      
      let movie = await Movie.findOne({ tmdbId: id });
      
      if (movie) {
        movie.searchCount += 1;
        movie.lastSearched = new Date();
        movie.trendingScore = this.calculateTrendingScore(movie.searchCount, movie.lastSearched);
        await movie.save();
      } else {
        movie = new Movie({
          tmdbId: id,
          title,
          overview,
          posterPath: poster_path,
          releaseDate: release_date,
          voteAverage: vote_average,
          voteCount: vote_count,
          searchCount: 1,
          trendingScore: this.calculateTrendingScore(1, new Date())
        });
        await movie.save();
      }
      
      return movie;
    } catch (error) {
      console.error('Error tracking popular movie:', error);
      throw error;
    }
  }

  // Get popular movies (first results only)
  static async getPopularMovies(limit = 10) {
    try {
      const movies = await Movie.find()
        .sort({ trendingScore: -1, searchCount: -1 })
        .limit(limit);
      
      return movies;
    } catch (error) {
      console.error('Error getting popular movies:', error);
      throw error;
    }
  }

  // Save a movie for a user
  static async saveMovieForUser(userId, movieData) {
    try {
      const { tmdbId, title, posterPath } = movieData;
      // Prevent duplicate saves
      let saved = await SavedMovie.findOne({ userId, tmdbId });
      if (!saved) {
        saved = new SavedMovie({ userId, tmdbId, title, posterPath });
        await saved.save();
      }
      return saved;
    } catch (error) {
      console.error('Error saving movie for user:', error);
      throw error;
    }
  }

  // Get all saved movies for a user
  static async getSavedMoviesForUser(userId) {
    try {
      return await SavedMovie.find({ userId }).sort({ savedAt: -1 });
    } catch (error) {
      console.error('Error fetching saved movies for user:', error);
      throw error;
    }
  }

  // Exponential decay trending score calculation
  static calculateTrendingScore(searchCount, lastSearched) {
    const now = new Date();
    const timeDiff = now - lastSearched;
    const daysSinceLastSearch = timeDiff / (1000 * 60 * 60 * 24);
    
    // Exponential decay: score = searchCount * e^(-decayRate * days)
    const decayRate = 0.1; // Adjust this for faster/slower decay
    const timeDecay = Math.exp(-decayRate * daysSinceLastSearch);
    
    return searchCount * timeDecay;
  }
}

module.exports = DatabaseService; 