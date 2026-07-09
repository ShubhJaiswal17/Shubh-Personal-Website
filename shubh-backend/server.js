'use strict';

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const compression  = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const dotenv  = require('dotenv');

dotenv.config();

const connectDB    = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const AppError     = require('./utils/AppError');

// ── Route imports ──────────────────────────────────────────────────────────────
const authRoutes       = require('./routes/auth.routes');
const blogRoutes       = require('./routes/blog.routes');
const categoryRoutes   = require('./routes/category.routes');
const newsletterRoutes = require('./routes/newsletter.routes');
const projectRoutes    = require('./routes/project.routes');
const contactRoutes    = require('./routes/contact.routes');
const analyticsRoutes  = require('./routes/analytics.routes');
const commentRoutes    = require('./routes/comment.routes');

connectDB();

const app = express();

// ── Security ───────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message:  { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
});
app.use('/api/', globalLimiter);

// ── General middleware ─────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/blog',       blogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/projects',   projectRoutes);
app.use('/api/contact',    contactRoutes);
app.use('/api/analytics',  analyticsRoutes);
app.use('/api/comments',   commentRoutes);

// ── 404 ────────────────────────────────────────────────────────────────────────
app.all('*', (req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// ── Global error handler ───────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────────────────────
const PORT   = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 Health: http://localhost:${PORT}/health\n`);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION 💥', err.name, err.message);
  server.close(() => process.exit(1));
});
process.on('SIGTERM', () => {
  server.close(() => console.log('Process terminated.'));
});

module.exports = app;
