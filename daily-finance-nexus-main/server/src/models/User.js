import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    // Either finance agent or shopkeeper
    role: {
      type: String,
      enum: ['finance', 'shopkeeper'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    financeName: String, // for finance agents
    uniqueId: {
      type: String,
      required: true,
      unique: true,
    },
    loanId: String, // for shopkeepers
    passwordHash: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.methods.isValidPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model('User', userSchema);
