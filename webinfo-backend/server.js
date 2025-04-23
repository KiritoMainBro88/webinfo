require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users'); // <-- ADD THIS

const app = express();
const mongoURI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3001;

if (!mongoURI) { console.error("FATAL ERROR: MONGODB_URI is not defined."); process.exit(1); }

app.use(cors()); app.use(express.json());

mongoose.connect(mongoURI) .then(() => console.log("Successfully connected to MongoDB Atlas!")) .catch(err => { console.error("MongoDB Connection Error:", err); process.exit(1); });

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes); // <-- ADD THIS

app.get('/', (req, res) => { res.send('Portfolio Backend API is running!'); });

app.listen(PORT, '0.0.0.0', () => { console.log(`Server listening on port ${PORT}`); });