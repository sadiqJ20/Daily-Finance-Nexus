import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get user by ID (limited fields)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name uniqueId phone');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 