import { Router } from "express";
import pool from "../db";

const router = Router();

/**
 * GET /users/leaderboard
 * מחזיר דירוג של כל המשתמשים לפי מספר הנקודות
 */
router.get("/leaderboard", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, total_points
       FROM users
       ORDER BY total_points DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Leaderboard error", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;