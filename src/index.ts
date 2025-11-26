import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import matchesRoutes from './routes/matches';
import predictionsRoutes from './routes/predictions';
import usersRoutes from "./routes/users";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS – ל־localhost ול־Netlify
app.use(cors({
  origin: [
    "https://iridescent-tulumba-1d1840.netlify.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.options('*', cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ ok: true, message: 'Football backend TS running' });
});

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/predictions', predictionsRoutes);
app.use("/api/users", usersRoutes);   // ✔️ מתוקן ומונח במקום הנכון

// START SERVER
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});