import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 환경 변수 설정 (.env 파일 로드)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // 포트 3000번 사용

// 미들웨어 설정
app.use(cors()); // 프론트엔드(5173)에서 오는 요청 허용
app.use(express.json()); // JSON 데이터 파싱 허용

// 기본 라우트 (테스트용)
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to CS Quiz Server! 🚀');
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});