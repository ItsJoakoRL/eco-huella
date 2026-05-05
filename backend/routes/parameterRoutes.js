import express from "express";
import {
  getAllParameters,
  getParametersByCategory,
  updateParameters,
  createParameters,
} from "../controllers/parameterController.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllParameters);
router.get("/:category", getParametersByCategory);

// Admin routes
router.post("/", auth, isAdmin, createParameters);
router.put("/:category", auth, isAdmin, updateParameters);

export default router;
