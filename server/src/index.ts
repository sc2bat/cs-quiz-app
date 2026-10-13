import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import quizRoutes from './routes/quizRoutes';
import trackRoutes from './routes/trackRoutes';
import { globalErrorHandler } from './utils/errorHandler';
import systemRoutes from './routes/systemRoutes';
import passport from 'passport';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const originList = [
    process.env.CORS_ORIGIN_LOCAL,
    process.env.CORS_ORIGIN_PROD,
    process.env.CORS_ORIGIN_PROD_WWW,
    process.env.CORS_ORIGIN_DEV,
    process.env.CORS_ORIGIN_DEV_WWW
  ].filter((origin): origin is string => !!origin);

// 미들웨어 설정
app.use(cors({
  origin: originList,
  credentials: true
}));
app.use(express.json()); // JSON 데이터 파싱 허용
app.use(passport.initialize());

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to CS Quiz Server! 🚀');
});

app.use('/api/tracks', trackRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/auth', authRoutes);

// error handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});