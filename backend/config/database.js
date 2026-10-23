import mongoose from "mongoose";

const RETRY_DELAY_MS = 5000;

// Mongoose crea los índices solo al definir cada modelo y da por perdido el intento
// si la conexión tarda más de 10 s; al reintentar la conexión hay que crearlos acá.
// Si falla (p. ej. ya hay datos repetidos para un índice único) se avisa en el log
// y la API sigue funcionando.
const ensureIndexes = () =>
  Promise.all(
    Object.values(mongoose.models).map((model) =>
      model.createIndexes().catch((error) => {
        console.error(`No se pudo crear un índice de ${model.modelName}: ${error.message}`);
      })
    )
  );

const connectDB = async () => {
  const mongoUri =
    process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;

  if (!mongoUri) {
    console.error("Error al conectar MongoDB: Falta configurar MONGODB_URI en las variables de entorno");
    return null;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
    await ensureIndexes();
    return conn;
  } catch (error) {
    console.error(`Error al conectar MongoDB: ${error.message}`);
    // Mongoose no reintenta la conexión inicial: sin esto, un corte de red al
    // arrancar dejaría la API respondiendo 503 hasta reiniciar el servicio.
    console.error(`Reintentando conectar en ${RETRY_DELAY_MS / 1000}s...`);
    setTimeout(connectDB, RETRY_DELAY_MS);
    return null;
  }
};

export default connectDB;
