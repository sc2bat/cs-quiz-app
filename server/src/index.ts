import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import quizRoutes from './routes/quizRoutes';
import { globalErrorHandler } from './utils/errorHandler';
import systemRoutes from './routes/systemRoutes';
import passport from 'passport';
import authRoutes from './routes/authRoutes';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const originList = [
    process.env.CORS_ORIGIN_LOCAL,
    process.env.CORS_ORIGIN,
    process.env.CORS_ORIGIN_WWW
  ].filter((origin): origin is string => !!origin);

// 미들웨어 설정
app.use(cors({
  origin: originList,
  credentials: true
}));
app.use(express.json()); // JSON 데이터 파싱 허용
app.use(passport.initialize());
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to CS Quiz Server! 🚀');
});

app.use('/api/quiz', quizRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/auth', authRoutes);

// error handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});