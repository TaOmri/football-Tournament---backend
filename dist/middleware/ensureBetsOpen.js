"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureBetsOpen = ensureBetsOpen;
const db_1 = __importDefault(require("../db"));
async function ensureBetsOpen(req, res, next) {
    try {
        const now = new Date();
        const { rows } = await db_1.default.query("SELECT bets_close_at FROM settings LIMIT 1");
        if (!rows.length) {
            return res.status(500).json({ error: "settings table missing bets_close_at" });
        }
        const closeAt = new Date(rows[0].bets_close_at);
        if (now > closeAt) {
            return res.status(403).json({ error: "Betting is closed" });
        }
        next();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal betting check error" });
    }
}
