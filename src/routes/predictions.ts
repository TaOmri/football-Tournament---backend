import { Router } from 'express';
import pool from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { ensureBetsOpen } from '../middleware/ensureBetsOpen';
import { calculateMatchPoints } from '../utils/scoring';

const router = Router();

/**
 * GET /api/predictions/mine
 * מחזיר את כל הניחושים של המשתמש
 */
router.get('/mine', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      `SELECT match_id, predicted_home, predicted_away
       FROM predictions
       WHERE user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Get predictions error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


/**
 * POST /api/predictions/bulk
 * שמירת ניחושים מרוכזת
 * כולל ensureBetsOpen – שמוודא שהחלון פתוח
 */
router.post('/bulk', authMiddleware, ensureBetsOpen, async (req: AuthRequest, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user!.id;
    const predictions = req.body.predictions as {
      matchId: number;
      home: number;
      away: number;
    }[];

    if (!Array.isArray(predictions)) {
      return res.status(400).json({ message: 'predictions array required' });
    }

    await client.query('BEGIN');

    for (const p of predictions) {
      await client.query(
        `INSERT INTO predictions (user_id, match_id, predicted_home, predicted_away)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, match_id)
         DO UPDATE SET
            predicted_home = EXCLUDED.predicted_home,
            predicted_away = EXCLUDED.predicted_away`,
        [userId, p.matchId, p.home, p.away]
      );
    }

    await client.query('COMMIT');

    return res.json({ ok: true });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Bulk predictions error:', err);
    return res.status(500).json({ message: 'Server error' });

  } finally {
    client.release();
  }
});


/**
 * GET /api/predictions/points
 * חישוב הניקוד של המשתמש
 */
router.get('/points', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      `SELECT p.match_id, p.predicted_home, p.predicted_away,
              m.result_home, m.result_away
       FROM predictions p
       JOIN matches m ON p.match_id = m.id
       WHERE p.user_id = $1`,
      [userId]
    );

    let total = 0;

    const perMatch = result.rows.map((r) => {
      const pts = calculateMatchPoints(
        r.predicted_home,
        r.predicted_away,
        r.result_home,
        r.result_away
      );
      total += pts;
      return { matchId: r.match_id, points: pts };
    });

    return res.json({ totalPoints: total, perMatch });

  } catch (err) {
    console.error('Points error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;