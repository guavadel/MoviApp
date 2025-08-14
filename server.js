require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const DatabaseService = require('./services/databaseService');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Root route for health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Movie App Backend is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/auth/register',
      '/api/auth/login', 
      '/api/auth/me',
      '/api/popular',
      '/api/saved',
      '/api/track-popular'
    ]
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Helper: auth middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, error: 'Email already in use' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select('_id email name');
  res.json({ success: true, user: { id: user._id, email: user.email, name: user.name } });
});

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

app.post('/api/saved', requireAuth, async (req, res) => {
  try {
    const { movie } = req.body;
    console.log('Saving movie for user:', req.userId, 'Movie:', movie);
    const saved = await DatabaseService.saveMovieForUser(req.userId, movie);
    res.json({ success: true, saved });
  } catch (error) {
    console.error('Error saving movie:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/saved', requireAuth, async (req, res) => {
  try {
    console.log('Fetching saved movies for user:', req.userId);
    const savedMovies = await DatabaseService.getSavedMoviesForUser(req.userId);
    console.log('Found saved movies:', savedMovies.length);
    res.json({ success: true, movies: savedMovies });
  } catch (error) {
    console.error('Error fetching saved movies:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
