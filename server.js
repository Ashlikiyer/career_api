require("dotenv").config();

const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const savedCareerRoutes = require('./routes/savedCareerRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const careerSuggestionRoutes = require('./routes/careerSuggestionRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const { debugFeedback } = require('./controllers/debugController');

const express = require("express");
const cors = require("cors");
const session = require('express-session');
const { sequelize } = require("./models");

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Session middleware with production-ready configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    name: 'connect.sid', // Standard session name
    cookie: { 
      secure: false, // Always false for HTTP (even in production)
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      sameSite: 'lax'
    },
    rolling: true,
    // Use default memory store (will be set automatically)
  })
);

// Session debugging middleware
app.use((req, res, next) => {
  console.log('Session Debug:', {
    url: req.url,
    method: req.method,
    sessionID: req.sessionID,
    hasSession: !!req.session,
    sessionData: req.session ? Object.keys(req.session) : 'no session',
    assessment_id: req.session?.assessment_id,
    cookies: req.headers.cookie ? 'present' : 'missing'
  });
  next();
});

// CORS middleware
const allowedOrigins = [
  "http://localhost:5173", // Local development
  "http://localhost:3000", // Alternative local port
  "https://careerai-eight.vercel.app", // Vercel production frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // For testing, allow localhost origins
      if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        return callback(null, true);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('CORS origin check:', { origin, allowedOrigins });
        // For now, allow all origins for testing - CHANGE THIS IN PRODUCTION
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200 // For legacy browser support
  })
);

// Root route
app.get("/", (req, res) => {
  res.send("Career App Backend is running");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    session: req.sessionID ? 'active' : 'inactive'
  });
});

// Session debug endpoint
app.get("/debug/session", (req, res) => {
  res.json({
    hasSession: !!req.session,
    sessionID: req.sessionID,
    sessionData: req.session,
    cookies: req.headers.cookie,
    headers: {
      'user-agent': req.headers['user-agent'],
      'origin': req.headers.origin,
      'referer': req.headers.referer
    }
  });
});

// Simple session test endpoint
app.post("/debug/session-test", (req, res) => {
  if (!req.session.counter) {
    req.session.counter = 1;
  } else {
    req.session.counter++;
  }
  
  res.json({
    message: 'Session test',
    counter: req.session.counter,
    sessionID: req.sessionID,
    isNewSession: req.session.isNew
  });
});

// Debug feedback endpoint
app.get("/debug/feedback", debugFeedback);

// Define API routes
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/saved-careers", savedCareerRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/career-suggestions", careerSuggestionRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/feedback", feedbackRoutes);

// Sync database and start server
const PORT = process.env.PORT || 5000;
sequelize
  .sync({ force: false })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });