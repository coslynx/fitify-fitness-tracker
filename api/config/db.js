import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const VITE_DATABASE_URL = process.env.VITE_DATABASE_URL;

if (!VITE_DATABASE_URL) {
    throw new Error('VITE_DATABASE_URL is not defined in the environment variables.');
}

let cachedClient = null;

/**
 * Asynchronously connects to a MongoDB database using the provided connection URL.
 *
 * @returns {Promise<MongoClient>} A Promise that resolves to a MongoDB client instance, or rejects with an error.
 */
const connectDB = async () => {
  if (cachedClient && cachedClient.isConnected()) {
      console.log("Using cached database connection");
      return cachedClient;
  }

  try {
    const url = new URL(VITE_DATABASE_URL);
    const dbName = url.pathname.substring(1);

    const client = new MongoClient(VITE_DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    console.log('Connected to MongoDB');
    cachedClient = client;
    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Failed to connect to MongoDB', { cause: error });
  }
};

export default connectDB;