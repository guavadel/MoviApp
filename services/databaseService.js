const Movie = require('../models/Movie');

class DatabaseService {
  // Track movie search
  static async trackMovieSearch(movieData) {
    try {
      const { id, title, overview, poster_path, release_date, vote_average, vote_count } = movieData;
      
      // Find existing movie or create new one
      let movie = await Movie.findOne({ tmdbId: id });
      
      if (movie) {
        // Update existing movie
        movie.searchCount += 1;
        movie.lastSearched = new Date();
        movie.trendingScore = this.calculateTrendingScore(movie.searchCount, movie.lastSearched);
        await movie.save();
      } else {
        // Create new movie
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
      console.error('Error tracking movie search:', error);
      throw error;
    }
  }

  // Get trending movies
  static async getTrendingMovies(limit = 10) {
    try {
      const movies = await Movie.find()
        .sort({ trendingScore: -1, searchCount: -1 })
        .limit(limit);
      
      return movies;
    } catch (error) {
      console.error('Error getting trending movies:', error);
      throw error;
    }
  }

  // Get most searched movies
  static async getMostSearchedMovies(limit = 10) {
    try {
      const movies = await Movie.find()
        .sort({ searchCount: -1 })
        .limit(limit);
      
      return movies;
    } catch (error) {
      console.error('Error getting most searched movies:', error);
      throw error;
    }
  }

  // Calculate trending score (you can customize this algorithm)
  static calculateTrendingScore(searchCount, lastSearched) {
    const now = new Date();
    const timeDiff = now - lastSearched;
    const daysSinceLastSearch = timeDiff / (1000 * 60 * 60 * 24);
    
    // Simple trending algorithm: more searches = higher score, but decays over time
    const baseScore = searchCount * 10;
    const timeDecay = Math.max(0.1, 1 - (daysSinceLastSearch * 0.1));
    
    return baseScore * timeDecay;
  }

  // Update trending scores for all movies
  static async updateTrendingScores() {
    try {
      const movies = await Movie.find();
      
      for (const movie of movies) {
        movie.trendingScore = this.calculateTrendingScore(movie.searchCount, movie.lastSearched);
        await movie.save();
      }
      
      console.log('Updated trending scores for all movies');
    } catch (error) {
      console.error('Error updating trending scores:', error);
      throw error;
    }
  }
}

module.exports = DatabaseService; 