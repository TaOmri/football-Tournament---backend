// src/routes/groups.ts
import { Router } from "express";
import pool from "../db";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/standings", authMiddleware, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.group_name,
        s.team_name,
        s.goals_for,
        s.goals_against,
        (s.goals_for - s.goals_against) AS goal_diff,
        s.points
      FROM (
        SELECT
          t.group_name,
          t.name AS team_name,
          
          -- הבקעות
          COALESCE(SUM(
            CASE
              WHEN m.id IS NULL THEN 0
              WHEN m.home_team_id = t.id THEN COALESCE(m.result_home, 0)
              WHEN m.away_team_id = t.id THEN COALESCE(m.result_away, 0)
              ELSE 0
            END
          ), 0) AS goals_for,

          -- ספיגות
          COALESCE(SUM(
            CASE
              WHEN m.id IS NULL THEN 0
              WHEN m.home_team_id = t.id THEN COALESCE(m.result_away, 0)
              WHEN m.away_team_id = t.id THEN COALESCE(m.result_home, 0)
              ELSE 0
            END
          ), 0) AS goals_against,

          -- נקודות (3 ניצחון, 1 תיקו, 0 הפסד)
          COALESCE(SUM(
            CASE
              WHEN m.id IS NULL OR m.result_home IS NULL OR m.result_away IS NULL THEN 0
              WHEN m.home_team_id = t.id AND m.result_home > m.result_away THEN 3
              WHEN m.away_team_id = t.id AND m.result_away > m.result_home THEN 3
              WHEN m.result_home = m.result_away THEN 1
              ELSE 0
            END
          ), 0) AS points

        FROM teams t
        LEFT JOIN matches m
          ON (m.home_team_id = t.id OR m.away_team_id = t.id)
         AND m.stage = t.group_name            -- "Group A" וכו

        WHERE t.group_name IS NOT NULL         -- רק קבוצות עם בית
        GROUP BY t.group_name, t.id, t.name
      ) AS s
      ORDER BY
        s.group_name,
        s.points DESC,
        (s.goals_for - s.goals_against) DESC,
        s.goals_for DESC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Group standings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;