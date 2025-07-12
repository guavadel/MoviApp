const SearchTerm = require('../models/SearchTerm');

class DatabaseService {
  // Track search term
  static async trackSearchTerm(searchTerm) {
    try {
      let term = await SearchTerm.findOne({ term: searchTerm.toLowerCase() });
      
      if (term) {
        term.searchCount += 1;
        term.lastSearched = new Date();
        term.trendingScore = this.calculateTrendingScore(term.searchCount, term.lastSearched);
        await term.save();
      } else {
        term = new SearchTerm({
          term: searchTerm.toLowerCase(),
          searchCount: 1,
          trendingScore: this.calculateTrendingScore(1, new Date())
        });
        await term.save();
      }
      
      return term;
    } catch (error) {
      console.error('Error tracking search term:', error);
      throw error;
    }
  }

  // Get trending search terms with exponential decay
  static async getTrendingSearchTerms(limit = 10) {
    try {
      const terms = await SearchTerm.find()
        .sort({ trendingScore: -1, searchCount: -1 })
        .limit(limit);
      
      return terms;
    } catch (error) {
      console.error('Error getting trending search terms:', error);
      throw error;
    }
  }

  // Get most searched terms
  static async getMostSearchedTerms(limit = 10) {
    try {
      const terms = await SearchTerm.find()
        .sort({ searchCount: -1 })
        .limit(limit);
      
      return terms;
    } catch (error) {
      console.error('Error getting most searched terms:', error);
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