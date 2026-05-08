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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "14mb" }));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/parameters", parameterRoutes);
app.use("/api/results", quizResultRoutes);
app.use("/api/admin/users", userRoutes);

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

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || "development"}`);
});
