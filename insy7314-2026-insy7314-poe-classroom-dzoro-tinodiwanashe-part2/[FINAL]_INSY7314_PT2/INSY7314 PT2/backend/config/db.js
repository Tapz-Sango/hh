const mongoose = require('mongoose');

// Connect to MongoDB Atlas cluster
const connectDB = async () => {
  try {
   const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    // Terminate the process if the connection fails
    process.exit(1);
  }
};

module.exports = connectDB;