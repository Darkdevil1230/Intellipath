const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Modern Mongoose handles parser and topology settings automatically. 
    // We just pass the URI string alone.
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;