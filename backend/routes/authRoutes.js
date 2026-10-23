import express from "express";
import {
  signup,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { auth } from "../middleware/auth.js";
import {
  loginLimiter,
  signupLimiter,
  forgotPasswordLimiter,
  forgotPasswordEmailLimiter,
  resetPasswordLimiter,
  resetPasswordEmailLimiter,
} from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/signup", signupLimiter, signup);
router.post("/login", loginLimiter, login);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  forgotPasswordEmailLimiter,
  forgotPassword
);
router.post(
  "/reset-password",
  resetPasswordLimiter,
  resetPasswordEmailLimiter,
  resetPassword
);
router.get("/profile", auth, getProfile);
// La foto de perfil viaja como data URL dentro del perfil: esta es la única ruta
// con límite de cuerpo grande (el resto usa el límite chico de server.js) y solo
// se lee el cuerpo después de comprobar la sesión.
router.put("/profile", auth, express.json({ limit: "14mb" }), updateProfile);

export default router;
