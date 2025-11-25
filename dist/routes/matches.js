"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authMiddleware, async (_req, res) => {
    try {
        const result = await db_1.default.query(`SELECT m.id, m.home_team_id, m.away_team_id, m.kickoff_at, m.stage,
              m.result_home, m.result_away,
              th.name as home_team_name, ta.name as away_team_name
       FROM matches m
       JOIN teams th ON m.home_team_id = th.id
       JOIN teams ta ON m.away_team_id = ta.id
       ORDER BY m.kickoff_at`);
        res.json(result.rows);
    }
    catch (err) {
        console.error('Get matches error', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
