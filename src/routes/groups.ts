import { Router } from "express";
import pool from "../db";
import { authMiddleware } from "../middleware/auth";

const router = Router();

/**
 * Group Standings A–H
 */
router.get("/standings", authMiddleware, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM (
        SELECT
          t.group_name,
          t.team_name,

          /* Goals For */
          SUM(
            CASE 
              WHEN m.result_home IS NULL THEN 0
              WHEN m.home_team_id = t.id THEN m.result_home
              WHEN m.away_team_id = t.id THEN m.result_away
              ELSE 0
            END
          ) AS goals_for,

          /* Goals Against */
          SUM(
            CASE 
              WHEN m.result_home IS NULL THEN 0
              WHEN m.home_team_id = t.id THEN m.result_away
              WHEN m.away_team_id = t.id THEN m.result_home
              ELSE 0
            END
          ) AS goals_against,

          /* Points */
          SUM(
            CASE
              WHEN m.result_home IS NULL THEN 0
              WHEN m.home_team_id = t.id AND m.result_home > m.result_away THEN 3
              WHEN m.away_team_id = t.id AND m.result_away > m.result_home THEN 3
              WHEN m.result_home = m.result_away THEN 1
              ELSE 0
            END
          ) AS points

        FROM teams t
        LEFT JOIN matches m
          ON (m.home_team_id = t.id OR m.away_team_id = t.id)
         AND m.stage = 'Group ' || t.group_name   -- ← תואם ל-Group A, Group B וכו'

        GROUP BY t.group_name, t.team_name
      ) AS subquery

      ORDER BY 
        group_name,
        points DESC,
        (goals_for - goals_against) DESC,
        goals_for DESC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Group standings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;