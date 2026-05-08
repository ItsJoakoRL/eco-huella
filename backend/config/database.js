import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;

    if (!mongoUri) {
      throw new Error("Falta configurar MONGODB_URI en las variables de entorno");
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error al conectar MongoDB: ${error.message}`);
    return null;
  }
};

export default connectDB;
