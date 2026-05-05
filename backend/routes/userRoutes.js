import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole,
} from "../controllers/userController.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Admin routes
router.get("/", auth, isAdmin, getAllUsers);
router.get("/:id", auth, isAdmin, getUserById);
router.put("/:id", auth, isAdmin, updateUser);
router.delete("/:id", auth, isAdmin, deleteUser);
router.patch("/:id/role", auth, isAdmin, changeUserRole);

export default router;
