import mysql, { Pool, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import dotenv from 'dotenv';
import logger from '../utils/logger';

// Vitest loads `.env.test` in tests/setup.ts — do not overlay local `.env`.
if (process.env.NODE_ENV !== 'test') {
  dotenv.config();
}

let poolInstance: Pool | null = null;

function getPool(): Pool {
  if (poolInstance) return poolInstance;

  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT) || 3306;
  const database = process.env.DB_NAME;
  const user = process.env.DB_USER_DEV;
  const password = process.env.DB_PASSWORD_DEV ?? '';

  logger.info(
    `MySQL pool → ${user}@${host}:${port}/${database} (password length=${password.length})`
  );

  poolInstance = mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  poolInstance
    .getConnection()
    .then((conn) => {
      logger.info('(O) MySQL Database Connected Successfully!');
      conn.release();
    })
    .catch((err) => {
      logger.error('(X) Database Connection Failed:', err);
    });

  return poolInstance;
}

/** Used by tests to close the pool between files. */
export const pool = {
  query: (...args: Parameters<Pool['query']>) => getPool().query(...args),
  execute: (...args: Parameters<Pool['execute']>) => getPool().execute(...args),
  getConnection: () => getPool().getConnection(),
  end: async () => {
    if (!poolInstance) return;
    const current = poolInstance;
    poolInstance = null;
    await current.end();
  },
};

export const db = {
  async query<T extends mysql.RowDataPacket[]>(sql: string, params?: any[]) {
    const start = Date.now();
    try {
      logger.debug(`[SQL QUERY] ${sql}`);
      const [rows, fields] = await getPool().query<T>(sql, params);
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
      const [result] = await getPool().execute<ResultSetHeader>(sql, params);
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
    const conn = await getPool().getConnection();
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
