require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require('express-session');
const { sequelize } = require("./models");
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const questionRoutes = require("./routes/questionRoutes");
const resultRoutes = require("./routes/resultRoutes");
const savedCareerRoutes = require("./routes/savedCareerRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Root route
app.get("/", (req, res) => {
  res.send("Career App Backend is running");
});

// Define API routes
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/saved-careers", savedCareerRoutes);
app.use("/api/roadmaps", roadmapRoutes);

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