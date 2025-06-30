import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || process.env.MONGODBURI;
if (!MONGODB_URI) {
  console.error('Set MONGODB_URI before running this script');
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB Atlas');
    
    // List all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(collection => console.log(' -', collection.name));
    
    // Count documents in each collection
    console.log('\nDocument counts:');
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(` - ${collection.name}: ${count} documents`);
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\nConnection closed');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });