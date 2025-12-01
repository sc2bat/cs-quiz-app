import mysql from 'mysql2/promise'; // 비동기 처리를 위해 promise 버전 사용
import dotenv from 'dotenv';

dotenv.config(); // .env 파일 로드

// 커넥션 풀 생성 (한 번 맺은 연결을 재사용해서 성능 최적화)
export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER_DEV,
  password: process.env.DB_PASSWORD_DEV,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10, // 동시에 최대 10개 연결 허용
  queueLimit: 0
});

// 연결 테스트용 로그
db.getConnection()
  .then((conn) => {
    console.log('✅ MySQL Database Connected Successfully!');
    conn.release(); // 연결 반납
  })
  .catch((err) => {
    console.error('❌ Database Connection Failed:', err);
  });