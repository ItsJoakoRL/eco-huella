import express from "express";
import {
  signup,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  acceptTerms,
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
router.post("/accept-terms", auth, acceptTerms);
// La foto de perfil viaja como data URL (el navegador la achica a ~100 KB): esta es la
// única ruta con un límite de cuerpo mayor al del resto (ver server.js) y solo se lee
// el cuerpo después de comprobar la sesión.
router.put("/profile", auth, express.json({ limit: "3mb" }), updateProfile);

export default router;
