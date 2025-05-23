// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const purchaseRoutes = require('./routes/purchase'); // <-- IMPORT NEW ROUTE

const app = express();
const mongoURI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3001;

if (!mongoURI) { console.error("FATAL ERROR: MONGODB_URI is not defined."); process.exit(1); }

// --- CORS Configuration ---
const allowedOrigins = [
    'http://localhost:5500', // Your local dev environment (adjust port if needed)
    'http://127.0.0.1:5500',
    'https://kiritomainbro88.github.io', // Your deployed frontend
    'https://kiritomainbro.github.io' // An alternative domain (if needed)
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin OR explicitly null origin (like local files)
        // Also allow origins in the allowedOrigins list
        if (!origin || origin === null || allowedOrigins.indexOf(origin) !== -1) {
             return callback(null, true);
        } else {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        // The line below was unreachable and has been removed.
    },
    credentials: true, // Allow cookies/headers if needed later
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204 // For legacy browser compatibility
};

app.use(cors(corsOptions));
// =======================

// UNCOMMENT THIS LINE - JSON parser is needed for processing request bodies
app.use(express.json());

mongoose.connect(mongoURI)
 .then(() => console.log("Successfully connected to MongoDB Atlas!"))
 .catch(err => { console.error("MongoDB Connection Error:", err); process.exit(1); });

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/purchase', purchaseRoutes); // <-- USE NEW ROUTE

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).send('API is healthy');
});

app.get('/', (req, res) => {
 res.send('Portfolio Backend API is running!');
});

// Basic error handling middleware (optional but recommended)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).send('Something broke!');
});


app.listen(PORT, '0.0.0.0', () => {
 console.log(`Server listening on port ${PORT}`);
});
