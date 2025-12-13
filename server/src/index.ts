import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import quizRoutes from './routes/quizRoutes';
import { globalErrorHandler } from './utils/errorHandler';
import systemRoutes from './routes/systemRoutes';

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

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to CS Quiz Server! 🚀');
});

app.use('/api/quiz', quizRoutes);
app.use('/api/system', systemRoutes);

// error handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});