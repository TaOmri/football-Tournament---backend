import { Request, Response, NextFunction } from "express";
import pool from "../db";

export async function ensureBetsOpen(req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();

    const { rows } = await pool.query(
      "SELECT bets_close_at FROM settings LIMIT 1"
    );

    if (!rows.length) {
      return res.status(500).json({ error: "settings table missing bets_close_at" });
    }

    const closeAt = new Date(rows[0].bets_close_at);

    if (now > closeAt) {
      return res.status(403).json({ error: "Betting is closed" });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal betting check error" });
  }
}