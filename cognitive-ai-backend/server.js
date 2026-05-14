import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import apiRoutes from './src/routes/apiRoutes.js'; //

const app = express();
const PORT = process.env.PORT || 5000;

// Konfigurasi Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    success: false,
    message: "Duh, kamu nanya mulu! Istirahat dulu sana, coba lagi 15 menit lagi."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware Global
app.use(cors());
app.use(express.json());

// --- BAGIAN YANG TADI KURANG ---
// Daftarkan rute API dan gunakan limiter secara spesifik di sini
app.use('/api', limiter, apiRoutes); 

app.listen(PORT, () => {
  console.log(`Server AI Berjalan Tajam di http://localhost:${PORT}`);
});