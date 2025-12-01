import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './config/db'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors()); // 프론트엔드(5173)에서 오는 요청 허용
app.use(express.json()); // JSON 데이터 파싱 허용

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to CS Quiz Server! 🚀');
});

// DB 연결 테스트용 API
app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    // 간단한 쿼리 실행 (현재 시간 가져오기)
    const [rows] = await db.query('SELECT NOW() as now');
    res.json({ status: 'success', data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'DB 연결 실패' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});