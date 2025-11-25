import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import matchesRoutes from './routes/matches';
import predictionsRoutes from './routes/predictions';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ ok: true, message: 'Football backend TS running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/predictions', predictionsRoutes);

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});