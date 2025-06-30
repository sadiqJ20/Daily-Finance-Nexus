import express from 'express';
import Loan from '../models/Loan.js';

const router = express.Router();

// Get all loans with finance creator details populated
router.get('/', async (_req, res) => {
  const loans = await Loan.find().populate('createdBy', 'name uniqueId phone');
  res.json(loans);
});

// Create loan
router.post('/', async (req, res) => {
  try {
    // Log the incoming request body for debugging
    console.log('Creating loan with data:', req.body);
    
    // Create the loan
    const loan = await Loan.create(req.body);
    // Populate finance info before sending response
    const populated = await loan.populate('createdBy', 'name uniqueId phone');
    res.status(201).json(populated);
  } catch (err) {
    console.error('Error creating loan:', err);
    if (err.code === 11000) return res.status(400).json({ message: 'Duplicate Loan ID' });
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Update loan
router.put('/:id', async (req, res) => {
  const loan = await Loan.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(loan);
});

// Delete loan
router.delete('/:id', async (req, res) => {
  await Loan.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;
