import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import Loan from './models/Loan.js';
import Payment from './models/Payment.js';

dotenv.config({ path: '../.env' });

const MONGODB_URI =
  process.env.MONGODB_URI || process.env.MONGODBURI || 'mongodb://localhost:27017/dfcs';

(async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Loan.deleteMany();
    await Payment.deleteMany();

    // Create finance user
    const financePassword = await bcrypt.hash('password123', 10);
    const finance = await User.create({
      role: 'finance',
      name: 'Alice Finance',
      financeName: 'Alice Financiers',
      uniqueId: 'FIN1001',
      phone: '9123456789',
      passwordHash: financePassword,
    });

    // Create shopkeeper user (no password required on backend model)
    const shopkeeperPassword = await bcrypt.hash('password123', 10);
    const shopkeeper = await User.create({
      role: 'shopkeeper',
      name: 'Bob Shopkeeper',
      uniqueId: 'SHOP1001',
      phone: '9876543210',
      loanId: 'SHKP1234',
      passwordHash: shopkeeperPassword,
    });

    // Loans
    const loan1 = await Loan.create({
      loanId: 'SHKP1234',
      shopkeeperName: 'Bob Shopkeeper',
      shopkeeperPhone: '9876543210',
      amount: 50000,
      startDate: new Date().toISOString(),
      duration: 120,
      dailyEmi: 500,
      createdBy: finance._id,
    });

    const loan2 = await Loan.create({
      loanId: 'SHKP5678',
      shopkeeperName: 'Charlie Store',
      shopkeeperPhone: '9123456780',
      amount: 30000,
      startDate: new Date().toISOString(),
      duration: 90,
      dailyEmi: 400,
      createdBy: finance._id,
    });

    // Payments for loan1
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    await Payment.create([
      {
        loanId: loan1._id,
        date: yesterday,
        status: 'paid',
        paidBy: finance._id,
      },
      {
        loanId: loan1._id,
        date: today,
        status: 'paid',
        paidBy: finance._id,
      },
    ]);

    console.log('Mock data inserted 🎉');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})(); 