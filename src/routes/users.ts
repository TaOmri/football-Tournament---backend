// src/routes/users.ts
import { Router } from "express";
import pool from "../db";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/leaderboard", authMiddleware, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, total_points
       FROM users
       ORDER BY total_points DESC NULLS LAST, username ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;