require('dotenv').config(); // Load .env variables FIRST
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Import auth routes
const categoryRoutes = require('./routes/categories'); // <-- ADD
const productRoutes = require('./routes/products');   // <-- ADD

const app = express();

// --- Environment Variables ---
const mongoURI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3001;

// --- Basic Error Handling ---
if (!mongoURI) {
  console.error("FATAL ERROR: MONGODB_URI environment variable is not defined.");
  process.exit(1);
}

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
mongoose.connect(mongoURI)
  .then(() => console.log("Successfully connected to MongoDB Atlas!"))
  .catch(err => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes); // <-- ADD
app.use('/api/products', productRoutes);   // <-- ADD

// --- Basic Root Route ---
app.get('/', (req, res) => {
  res.send('Portfolio Backend API is running!');
});

// --- Start Server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});