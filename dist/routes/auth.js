"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'username and password required' });
    }
    try {
        const existing = await db_1.pool.query('SELECT id FROM users WHERE username = $1', [username]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: 'Username already taken' });
        }
        const hash = await bcryptjs_1.default.hash(password, 10);
        const result = await db_1.pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username', [username, hash]);
        const user = result.rows[0];
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
        res.json({ token, user });
    }
    catch (err) {
        console.error('Register error', err);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'username and password required' });
    }
    try {
        const result = await db_1.pool.query('SELECT id, username, password_hash FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const user = result.rows[0];
        const ok = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!ok) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, username: user.username } });
    }
    catch (err) {
        console.error('Login error', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
