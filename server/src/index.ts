import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './config/db';
import quizRoutes from './routes/quizRoutes';
import { QUERIES } from './models/queries';

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

// DB 연결 테스트용 API
app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    // 간단한 쿼리 실행 (현재 시간 가져오기)
    const [rows] = await db.query(QUERIES.GET_NOW_TIMESTAMP);
    res.json({ status: 'success', data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'DB 연결 실패' });
  }
});

app.use('/api/quizzes', quizRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});