import { MongoClient, Db, MongoClientOptions } from 'mongodb';

// Validate environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

// Type for the cached connection
interface CachedConnection {
  conn: { client: MongoClient; db: Db } | null;
  promise: Promise<{ client: MongoClient; db: Db }> | null;
}

// Initialize the cached connection
const cached: CachedConnection = (global as any).mongo || { conn: null, promise: null };

if (!(global as any).mongo) {
  (global as any).mongo = cached;
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cached.conn) {
    console.log('Using existing database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('Creating new database connection');
    const options: MongoClientOptions = {
      connectTimeoutMS: 5000, // 5 seconds
      serverSelectionTimeoutMS: 5000, // 5 seconds
      retryWrites: true,
      w: 'majority',
    };

    try {
      cached.promise = MongoClient.connect(MONGODB_URI, options).then((client) => {
        console.log('Successfully connected to MongoDB');
        return {
          client,
          db: client.db(MONGODB_DB),
        };
      }).catch((error) => {
        console.error('MongoDB connection error:', error);
        throw new Error(`Failed to connect to MongoDB: ${error.message}`);
      });
    } catch (error) {
      console.error('Error creating MongoDB connection:', error);
      throw new Error(`Failed to create MongoDB connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // Reset the cached promise if the connection fails
    cached.promise = null;
    throw error;
  }
}

export async function withDatabase(handler: any) {
  return async function(...args: any[]) {
    try {
      const { db } = await connectToDatabase();
      return handler(db, ...args);
    } catch (error) {
      console.error('Database connection error:', error);
      throw new Error(`Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
}
