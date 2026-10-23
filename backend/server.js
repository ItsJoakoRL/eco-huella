import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import parameterRoutes from "./routes/parameterRoutes.js";
import quizResultRoutes from "./routes/quizResultRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { getJwtSecret } from "./config/jwt.js";

dotenv.config();

// En producción el servidor no debe arrancar sin clave de firma de tokens.
try {
  getJwtSecret();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS_ORIGIN admite uno o varios orígenes separados por coma. Si no se define,
// se mantiene el comportamiento anterior (cualquier origen).
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : undefined));

// Detrás del proxy de Render, sin esto todos los usuarios compartirían la misma IP
// y el límite de intentos bloquearía a todos a la vez. Render define RENDER=true en
// todos sus servicios, así que no depende de que NODE_ENV esté bien configurado.
if (process.env.NODE_ENV === "production" || process.env.RENDER === "true") {
  app.set("trust proxy", 1);
}

// Límite chico para todo; PUT /api/auth/profile (foto de perfil) lo amplía en su ruta.
const jsonParser = express.json({ limit: "100kb" });
app.use((req, res, next) => {
  if (req.method === "PUT" && req.path === "/api/auth/profile") return next();
  return jsonParser(req, res, next);
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "EcoHuella API running", timestamp: new Date().toISOString() });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "Backend running",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.get(["/healthz", "/saludz"], (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const requireDatabase = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message:
        "La base de datos no está conectada. Enciende MongoDB y vuelve a intentarlo.",
    });
  }

  next();
};

// Connect to MongoDB
await connectDB();

// Routes
app.use("/api", requireDatabase);
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/parameters", parameterRoutes);
app.use("/api/results", quizResultRoutes);
app.use("/api/admin/users", userRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Error handler
app.use((err, req, res, _next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "El contenido enviado es demasiado grande" });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "La solicitud no tiene un formato válido" });
  }

  console.error(err.stack);
  res.status(500).json({ message: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || "development"}`);
});
