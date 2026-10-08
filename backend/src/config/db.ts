import mongoose from 'mongoose';

// Declare a cached variable in the global scope to hold the connection promise.
// Caching the promise rather than the connection prevents race conditions
// when multiple concurrent requests hit a cold container simultaneously.
let cachedDb: any = null;

export const connectDB = async () => {
  // If a connection already exists and is fully ready, return it immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If a connection attempt is currently in progress, wait for it to finish
  if (cachedDb) {
    try {
      await cachedDb;
      return mongoose.connection;
    } catch (error) {
      // If the pending connection fails, clear the cache to allow retries
      cachedDb = null;
      throw error;
    }
  }

  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME;

  if (!mongoUri || !dbName) {
    const errorMsg = '❌ Missing required database environment variables: MONGODB_URI and/or DB_NAME.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  // Efficient Mongoose options, particularly for serverless/ephemeral environments
  const opts = {
    dbName: dbName,                 // Specify the database name here
    bufferCommands: false,          // Fail fast instead of buffering queries if disconnected
    serverSelectionTimeoutMS: 5000, // 5s timeout instead of the default 30s
    maxPoolSize: 10,                // Optimize socket pool for concurrent requests
  };

  console.log('Connecting to MongoDB...');

  // Establish a new connection and cache the PROMISE
  cachedDb = mongoose.connect(mongoUri, opts)
    .then((mongooseInstance) => {
      console.log(`✅ MongoDB Connected: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    })
    .catch((error) => {
      console.error(`❌ DB Connection Error: ${error.message}`);
      cachedDb = null; // Clear cache on failure so subsequent requests can try again
      throw error;
    });

  // Await the newly cached promise
  await cachedDb;
  return mongoose.connection;
};
