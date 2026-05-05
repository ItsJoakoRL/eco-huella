import express from "express";
import {
  getMyResults,
  getResultById,
  saveQuizResult,
  updateQuizResult,
  deleteQuizResult,
  getAllResults,
} from "../controllers/quizResultController.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// User routes
router.get("/", auth, getMyResults);
router.get("/:id", auth, getResultById);
router.post("/", auth, saveQuizResult);
router.put("/:id", auth, updateQuizResult);
router.delete("/:id", auth, deleteQuizResult);

// Admin routes
router.get("/admin/all", auth, isAdmin, getAllResults);

export default router;
