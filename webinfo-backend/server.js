require('dotenv').config(); // Load .env variables FIRST
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Import auth routes

const app = express();

// --- Environment Variables ---
const mongoURI = process.env.MONGODB_URI;
// Render provides the PORT environment variable - use it! Fallback for local.
const PORT = process.env.PORT || 3001;

// --- Basic Error Handling for Missing Env Vars ---
if (!mongoURI) {
  console.error("FATAL ERROR: MONGODB_URI environment variable is not defined.");
  process.exit(1); // Exit the application if DB connection string is missing
}

// --- Middleware ---
// Enable CORS for all origins (adjust in production for security)
// This allows your frontend (e.g., GitHub Pages) to talk to this backend
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// --- Database Connection ---
mongoose.connect(mongoURI) // Removed deprecated options
  .then(() => console.log("Successfully connected to MongoDB Atlas!"))
  .catch(err => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1); // Exit if cannot connect to DB
  });

// --- API Routes ---
app.use('/api/auth', authRoutes); // Mount the authentication routes under /api/auth path

// --- Basic Root Route (for testing if server is up) ---
app.get('/', (req, res) => {
  res.send('Portfolio Backend API is running!');
});

// --- Start Server ---
// Listen on 0.0.0.0 is important for Render deployment
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});