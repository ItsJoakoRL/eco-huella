import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error al conectar MongoDB: ${error.message}`);
    return null;
  }
};

export default connectDB;
