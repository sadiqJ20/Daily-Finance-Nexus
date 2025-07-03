import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// helper to sign JWT
const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

/* Finance / Shopkeeper Registration */
router.post('/register', async (req, res) => {
  console.log('🔵 /register route was called');
  try {
    const { role, name, financeName, uniqueId, loanId, password } = req.body;

    const exists = await User.findOne({ uniqueId });
    if (exists) return res.status(400).json({ message: 'Unique ID already used' });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ role, name, financeName, uniqueId, loanId, passwordHash });
    console.log('User registered:', user);
    const token = signToken(user);

    res.status(201).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* Login */
router.post('/login', async (req, res) => {
  try {
    const { uniqueId, password } = req.body;
    const user = await User.findOne({ uniqueId });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await user.isValidPassword(password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test route for connectivity
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working' });
});

export default router;
