import { Router } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (_req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.home_team_id, m.away_team_id, m.kickoff_at, m.stage,
              m.result_home, m.result_away,
              th.name as home_team_name, ta.name as away_team_name
       FROM matches m
       JOIN teams th ON m.home_team_id = th.id
       JOIN teams ta ON m.away_team_id = ta.id
       ORDER BY m.kickoff_at`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get matches error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;