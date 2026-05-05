import express from "express";
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllQuestions);
router.get("/:id", getQuestionById);

// Admin routes
router.post("/", auth, isAdmin, createQuestion);
router.put("/:id", auth, isAdmin, updateQuestion);
router.delete("/:id", auth, isAdmin, deleteQuestion);

export default router;
