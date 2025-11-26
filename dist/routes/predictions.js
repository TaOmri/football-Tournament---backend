"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const auth_1 = require("../middleware/auth");
const scoring_1 = require("../utils/scoring");
const router = (0, express_1.Router)();
/* ---------------------------------------------------
   GET /predictions/mine   → predictions of logged user
---------------------------------------------------- */
router.get("/mine", auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db_1.default.query(`SELECT match_id, predicted_home, predicted_away
       FROM predictions
       WHERE user_id = $1`, [userId]);
        res.json(result.rows);
    }
    catch (err) {
        console.error("Get predictions error", err);
        res.status(500).json({ message: "Server error" });
    }
});
/* ---------------------------------------------------
   POST /predictions/bulk   → save all predictions
   AND update total_points properly
---------------------------------------------------- */
router.post("/bulk", auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const predictions = req.body.predictions;
        if (!Array.isArray(predictions)) {
            return res.status(400).json({ message: "predictions array required" });
        }
        await db_1.default.query("BEGIN");
        for (const p of predictions) {
            await db_1.default.query(`INSERT INTO predictions (user_id, match_id, predicted_home, predicted_away)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, match_id)
         DO UPDATE SET predicted_home = EXCLUDED.predicted_home,
                       predicted_away = EXCLUDED.predicted_away`, [userId, p.matchId, p.home, p.away]);
        }
        // Recalculate user total score
        const scoreQuery = await db_1.default.query(`SELECT p.predicted_home, p.predicted_away,
              m.result_home, m.result_away
       FROM predictions p
       JOIN matches m ON m.id = p.match_id
       WHERE p.user_id = $1 AND m.result_home IS NOT NULL`, [userId]);
        let total = 0;
        scoreQuery.rows.forEach((r) => {
            total += (0, scoring_1.calculateMatchPoints)(r.predicted_home, r.predicted_away, r.result_home, r.result_away);
        });
        await db_1.default.query(`UPDATE users SET total_points = $1 WHERE id = $2`, [total, userId]);
        await db_1.default.query("COMMIT");
        res.json({ ok: true, totalPoints: total });
    }
    catch (err) {
        await db_1.default.query("ROLLBACK");
        console.error("Bulk predictions error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
/* ---------------------------------------------------
   GET /predictions/points  → get total + per match
   (also updates users.total_points)
---------------------------------------------------- */
router.get("/points", auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db_1.default.query(`SELECT p.match_id, p.predicted_home, p.predicted_away,
              m.result_home, m.result_away
       FROM predictions p
       JOIN matches m ON p.match_id = m.id
       WHERE p.user_id = $1`, [userId]);
        let total = 0;
        const perMatch = result.rows.map((r) => {
            const pts = (0, scoring_1.calculateMatchPoints)(r.predicted_home, r.predicted_away, r.result_home, r.result_away);
            total += pts;
            return { matchId: r.match_id, points: pts };
        });
        // Update DB total points
        await db_1.default.query(`UPDATE users SET total_points = $1 WHERE id = $2`, [total, userId]);
        res.json({ totalPoints: total, perMatch });
    }
    catch (err) {
        console.error("Points error", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;
