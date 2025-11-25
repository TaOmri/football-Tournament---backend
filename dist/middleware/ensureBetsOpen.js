"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureBetsOpen = ensureBetsOpen;
const db_1 = __importDefault(require("../db")); // התאמה למסלול אצלך
async function ensureBetsOpen(req, res, next) {
    try {
        const now = new Date();
        const { rows } = await db_1.default.query("SELECT bets_close_at FROM settings LIMIT 1");
        if (rows.length === 0) {
            return res.status(500).json({ error: "bets_close_at not configured in settings table" });
        }
        const closeAt = new Date(rows[0].bets_close_at);
        if (now > closeAt) {
            return res.status(403).json({ error: "Betting is closed for this tournament." });
        }
        next();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal error checking betting status" });
    }
}
