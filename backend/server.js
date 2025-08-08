// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mediaPerformanceRoutes = require('./routes/media-performance');

const app = express();
const PORT = process.env.PORT || 5000;

/** CORS */
const allowList = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://horizon-analytics.app',
  'https://blu-performance-dashboard.vercel.app'
];
const corsOptions = {
  origin: (origin, cb) => {
    // allow server-to-server / curl (no origin)
    if (!origin) return cb(null, true);
    const ok =
      allowList.includes(origin) ||
      /\.vercel\.app$/.test(origin); // allow vercel preview URLs
    return cb(ok ? null : new Error('CORS not allowed'), ok);
  },
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** Basic security headers */
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

/** Health check */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Blu Performance Dashboard API is running',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    domain: 'horizon-analytics.app'
  });
});

/** Legacy data endpoint */
app.get('/api/data', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const Papa = require('papaparse');
    const dataPath = path.join(__dirname, 'data', 'sample-data.csv');
    const fileContent = await fs.readFile(dataPath, 'utf8');
    const parsedData = Papa.parse(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });
    res.json({ success: true, data: parsedData.data, meta: parsedData.meta });
  } catch (error) {
    console.error('Error in /api/data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/** Feature routes */
app.use('/api/media-performance', mediaPerformanceRoutes);

/** Metadata endpoint */
app.get('/api/metadata', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const Papa = require('papaparse');
    const dataPath = path.join(__dirname, 'data', 'mediacontribution.csv');
    const fileContent = await fs.readFile(dataPath, 'utf8');
    const parsed = Papa.parse(fileContent, { header: true, dynamicTyping: true, skipEmptyLines: true });

    const toSet = (key) => [...new Set(parsed.data.map(row => row[key]))].filter(Boolean).sort();

    const metadata = {
      partners: toSet('partner'),
      channels: toSet('channel'),
      campaigns: toSet('campaign'),
      brands: toSet('brand'),
      tactics: toSet('tactic'),
      dateRange: {
        earliest: Math.min(...parsed.data.map(row => new Date(row['week-date']))),
        latest: Math.max(...parsed.data.map(row => new Date(row['week-date']))),
        totalWeeks: [...new Set(parsed.data.map(row => row['week-date']))].length
      },
      periodOptions: [
        { value: 4, label: 'Last 4 weeks', description: 'Recent monthly performance' },
        { value: 12, label: 'Last 12 weeks', description: 'Quarterly view' },
        { value: 24, label: 'Last 24 weeks', description: 'Semi-annual analysis' },
        { value: 36, label: 'Last 36 weeks', description: 'Full year perspective' }
      ]
    };

    res.json(metadata);
  } catch (error) {
    console.error('Error in /api/metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

/** Error handler */
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

/** 404 for unknown API routes */
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    requestedPath: req.originalUrl,
    availableRoutes: [
      '/api/health',
      '/api/metadata',
      '/api/media-performance/partners',
      '/api/media-performance/partner-tactics',
      '/api/media-performance/trends',
      '/api/media-performance/channels',
      '/api/media-performance/global-metrics'
    ]
  });
});

/** Export the app for Vercel serverless */
module.exports = app;

/** Start a server ONLY in local dev (not on Vercel) */
if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Blu Performance Dashboard API running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Domain: horizon-analytics.app`);
    console.log(`📊 Available endpoints:`);
    console.log(`   GET /api/health`);
    console.log(`   GET /api/metadata`);
    console.log(`   GET /api/media-performance/partners?period=12`);
    console.log(`   GET /api/media-performance/partner-tactics?period=12&partner=GOOGLEADS`);
    console.log(`   GET /api/media-performance/trends?period=12&groupBy=week`);
    console.log(`   GET /api/media-performance/channels?period=12`);
    console.log(`   GET /api/media-performance/global-metrics?period=12`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });
}
