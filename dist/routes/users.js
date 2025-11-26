"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/leaderboard", auth_1.authMiddleware, async (_req, res) => {
    try {
        const result = await db_1.default.query(`SELECT username, total_points
       FROM users
       ORDER BY total_points DESC NULLS LAST`);
        res.json(result.rows);
    }
    catch (err) {
        console.error("Leaderboard error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;
