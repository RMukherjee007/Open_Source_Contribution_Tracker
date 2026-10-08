require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const githubRoutes = require('./routes/githubRoutes');
const rateLimit = require('express-rate-limit');

const app = express();

// Required behind Render/Cloud reverse proxies for accurate client IP rate limiting
app.set('trust proxy', 1);

app.use(express.json());
app.use(cors());

// Health check endpoint for Render service monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply rate limiting to API requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api', limiter);

// Connect to MongoDB using an environment variable for the cloud, falling back to local
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/os-tracker';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB error:', err));

// Apply the routes
app.use('/api/github', githubRoutes);

// Serve frontend if built files exist
const distPath = path.join(__dirname, '../os-tracker-frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Catch-all to serve React app for client-side routing
  app.use((req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'OS Tracker API is online' });
  });
}

// Use dynamic port provided by Render (PORT env variable), fallback to 5001 locally
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));