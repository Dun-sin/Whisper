import mongoose, { Connection, Error, Mongoose } from 'mongoose';
import { init } from './lib/lib';

// Initialize variables to store the MongoDB connection and Mongoose instance.
let connection: Connection | null = null;
let mongooseInstance: Mongoose | null = null;

// Retrieve the MongoDB connection string from environment variables.
const connectionString = process.env.MongoDB_URL;

// Async function to establish and return a MongoDB connection.
const connectMongo = async (): Promise<Connection> => {
  // Check if the connection string is defined in the environment.
  if (!connectionString) {
    throw new Error('Connection String is missing, add it to the env file');
  }

  // If a connection already exists, return it.
  if (connection) {
    return connection;
  }

  try {
    // Define connection options for MongoDB.
    const options = {
      autoIndex: true,
      family: 4,
      maxPoolSize: 10,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    mongoose.set('strictQuery', false);

    // Connect to MongoDB and store the Mongoose instance.
    mongooseInstance = await mongoose.connect(connectionString, options);

    // Get the MongoDB connection from the Mongoose instance.
    connection = mongooseInstance.connection;

    init()
      .then(done => console.log(`sorted the search`))
      .catch(error => console.log(error));

    // Log a successful database connection.
    console.log('DB connection successful:', connection.name);

    // Return the MongoDB connection.
    return connection;
  } catch (error) {
    // Handle any errors that occur during the connection process.
    const errorMessage = error as Error;
    console.error('DB connection failed:', errorMessage.message);

    // Re-throw the error to signal the failure.
    throw error;
  }
};

// Export the connectMongo function for use in other parts of your application.
export default connectMongo;
