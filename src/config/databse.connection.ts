import mongoose, { ConnectOptions } from "mongoose";

const defaultOptions: ConnectOptions = {
  maxPoolSize: 10, // maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // time in ms to wait for server selection
  socketTimeoutMS: 45000, // close sockets after 45s of inactivity
};

const connectDB = async (mongoURI: string) => {
  const connectWithRetry = async (retries = 5, delay = 3000): Promise<void> => {
    try {
      await mongoose.connect(mongoURI, defaultOptions);
      console.log("Database connected successfully");

      mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected. Trying to reconnect...");
      });

      mongoose.connection.on("reconnected", () => {
        console.log("MongoDB reconnected");
      });

      mongoose.connection.on("error", (err) => {
        console.error("MongoDB error:", err);
      });
    } catch (err) {
      if (retries === 0) {
        console.error("Could not connect to MongoDB after retries:", err);
        process.exit(1);
      } else {
        console.warn(
          `Retry connecting in ${delay / 1000}s... (${retries} retries left)`
        );
        setTimeout(() => connectWithRetry(retries - 1, delay), delay);
      }
    }
  };

  await connectWithRetry();

  // Graceful shutdown
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log(" MongoDB connection closed on app termination");
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await mongoose.connection.close();
    console.log(" MongoDB connection closed on container stop");
    process.exit(0);
  });
};

export default connectDB;
