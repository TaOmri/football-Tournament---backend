import { Router } from "express";
import pool from "../db";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/standings", authMiddleware, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t.id,
        t.group_name,
        t.name AS team_name,

        -- Goals For
        COALESCE(SUM(
          CASE 
            WHEN m.home_team_id = t.id THEN m.result_home
            WHEN m.away_team_id = t.id THEN m.result_away
            ELSE 0
          END
        ), 0) AS goals_for,

        -- Goals Against
        COALESCE(SUM(
          CASE 
            WHEN m.home_team_id = t.id THEN m.result_away
            WHEN m.away_team_id = t.id THEN m.result_home
            ELSE 0
          END
        ), 0) AS goals_against,

        -- Points
        COALESCE(SUM(
          CASE
            WHEN m.result_home IS NULL THEN 0
            WHEN m.home_team_id = t.id AND m.result_home > m.result_away THEN 3
            WHEN m.away_team_id = t.id AND m.result_away > m.result_home THEN 3
            WHEN m.result_home = m.result_away THEN 1
            ELSE 0
          END
        ), 0) AS points

      FROM teams t
      LEFT JOIN matches m
        ON m.home_team_id = t.id OR m.away_team_id = t.id

      WHERE t.group_name IS NOT NULL

      GROUP BY t.id, t.group_name, t.name
      ORDER BY t.group_name,
               points DESC,
               (COALESCE(SUM(
                  CASE 
                    WHEN m.home_team_id = t.id THEN m.result_home
                    WHEN m.away_team_id = t.id THEN m.result_away
                    ELSE 0
                  END
                ),0) - 
                COALESCE(SUM(
                  CASE 
                    WHEN m.home_team_id = t.id THEN m.result_away
                    WHEN m.away_team_id = t.id THEN m.result_home
                    ELSE 0
                  END
                ),0)
               ) DESC,
               goals_for DESC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Group standings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;