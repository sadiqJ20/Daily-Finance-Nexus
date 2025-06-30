import express from 'express';
import Payment from '../models/Payment.js';

const router = express.Router();

// Get payments, optional loanId filter
router.get('/', async (req, res) => {
  const { loanId } = req.query;
  const filter = loanId ? { loanId } : {};
  const payments = await Payment.find(filter);
  res.json(payments);
});

// Record payment or missed
router.post('/', async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json(payment);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Payment already recorded for today' });
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
