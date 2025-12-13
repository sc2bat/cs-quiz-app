import mysql from 'mysql2/promise'; // 비동기 처리를 위해 promise 버전 사용
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config(); // .env 파일 로드

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER_DEV,
  password: process.env.DB_PASSWORD_DEV,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10, // 동시에 최대 10개 연결 허용
  queueLimit: 0
});

export const db = {
  query: async <T extends mysql.RowDataPacket[]>(sql: string, params?: any[]) =>{
    try {
      logger.info(`[SQL Executing] ${sql}`)

      const [rows, fields] = await pool.query<T>(sql, params);

      return [rows, fields] as const;
    } catch (error: any) {
      logger.error(`[SQL ERROR] ${error.message} \nQuery: ${sql}`);
      throw error;
    }
  }
};

// 연결 테스트용 로그
pool.getConnection()
  .then((conn) => {
    console.log('✅ MySQL Database Connected Successfully!');
    logger.info('✅ MySQL Database Connected Successfully!');
    conn.release(); // 연결 반납
  })
  .catch((err) => {
    console.error('❌ Database Connection Failed:', err);
    logger.error('❌ Database Connection Failed:', err);
  });