import { Request, Response, NextFunction } from "express";
import db from "../db";  // התאמה למסלול אצלך

export async function ensureBetsOpen(req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();

    const { rows } = await db.query("SELECT bets_close_at FROM settings LIMIT 1");

    if (rows.length === 0) {
      return res.status(500).json({ error: "bets_close_at not configured in settings table" });
    }

    const closeAt = new Date(rows[0].bets_close_at);

    if (now > closeAt) {
      return res.status(403).json({ error: "Betting is closed for this tournament." });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error checking betting status" });
  }
}