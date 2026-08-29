// src/index.js
// Express server entry point

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { initializeSheets } = require('./services/sheets.service');

const studentRoutes = require('./routes/student.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security middleware ──────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.set('trust proxy', 1);

// ── CORS ─────────────────────────────────────────────────
const allowedOrigins = [
  (process.env.FRONTEND_URL || '').replace(/\/$/, ''),
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    const cleanOrigin = origin.replace(/\/$/, '');
    
    // Allow if in allowedOrigins list or ends with .vercel.app
    if (
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    
    callback(new Error(`CORS policy: ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Logging ──────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// ── Health check ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SSEC Token Management API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ── Routes ───────────────────────────────────────────────
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

// Alias for token public endpoints
app.use('/api', studentRoutes);

// ── 404 handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ── Global error handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── Start ─────────────────────────────────────────────────
async function start() {
  try {
    console.log('[Server] Connecting to Google Sheets...');
    await initializeSheets();
    console.log('[Server] Google Sheets initialized.');
    app.listen(PORT, () => {
      console.log(`[Server] SSEC Token API running on port ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err.message);
    process.exit(1);
  }
}

start();

module.exports = app;
