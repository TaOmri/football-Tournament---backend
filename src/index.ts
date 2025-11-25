import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import matchesRoutes from './routes/matches';
import predictionsRoutes from './routes/predictions';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS FIX — חשוב ל-Railway + Netlify
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "https://iridescent-tulumba-1d1840.netlify.app",
      "https://football-tournament-frontend.netlify.app", // אם יש לך דומיין אחר
      "*"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ ok: true, message: 'Football backend TS running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/predictions', predictionsRoutes);

// Server
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});