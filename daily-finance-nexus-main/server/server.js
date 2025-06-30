import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './src/routes/auth.js';
import loanRoutes from './src/routes/loans.js';
import paymentRoutes from './src/routes/payments.js';
import userRoutes from './src/routes/users.js';

// Load environment variables
dotenv.config();

// Accept both spellings; exit if none found
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODBURI;
if (!MONGODB_URI) {
  console.error(
    '❌  Missing MongoDB connection string.\n' +
    '    Add MONGODB_URI=<your-uri> to server/.env'
  );
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({ message: 'DFCS API running' });
});

// Connect to MongoDB and start server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
