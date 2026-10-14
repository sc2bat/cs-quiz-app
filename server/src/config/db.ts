import mysql, { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER_DEV,
  password: process.env.DB_PASSWORD_DEV,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = {
  async query<T extends mysql.RowDataPacket[]>(sql: string, params?: any[]) {
    const start = Date.now();
    try {
      logger.debug(`[SQL QUERY] ${sql}`);
      const [rows, fields] = await pool.query<T>(sql, params);
      const duration = Date.now() - start;
      if (Array.isArray(rows)) {
        logger.debug(`[SQL RESULT] (${duration}ms) Fetched ${rows.length} rows`);
      }
      return [rows, fields] as const;
    } catch (error: any) {
      logger.error(`[SQL QUERY ERROR] ${error.message} \nQuery: ${sql}`);
      throw error;
    }
  },
  async execute(sql: string, params?: any[]): Promise<ResultSetHeader> {
    const start = Date.now();
    try {
      logger.debug(`[SQL EXECUTE] ${sql}`);
      const [result] = await pool.execute<ResultSetHeader>(sql, params);
      const duration = Date.now() - start;
      logger.debug(
        `[SQL RESULT] (${duration}ms) Affected: ${result.affectedRows}, InsertId: ${result.insertId}`
      );
      return result;
    } catch (error: any) {
      logger.error(`[SQL EXECUTE ERROR] ${error.message} \nQuery: ${sql}`);
      throw error;
    }
  },
  async transaction<T>(callback: (conn: PoolConnection) => Promise<T>): Promise<T> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      logger.debug('[Transaction] STARTED');
      const result = await callback(conn);
      await conn.commit();
      logger.debug('[Transaction] COMMITTED');
      return result;
    } catch (error) {
      await conn.rollback();
      logger.error('[Transaction] ROLLED BACK', error);
      throw error;
    } finally {
      conn.release();
    }
  },
};

pool
  .getConnection()
  .then((conn) => {
    logger.info('(O) MySQL Database Connected Successfully!');
    conn.release();
  })
  .catch((err) => {
    logger.error('(X) Database Connection Failed:', err);
  });
