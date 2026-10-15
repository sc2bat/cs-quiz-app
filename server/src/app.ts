import express, { Request, Response } from 'express';
import cors from 'cors';
import passport from 'passport';
import quizRoutes from './routes/quizRoutes';
import trackRoutes from './routes/trackRoutes';
import { globalErrorHandler } from './utils/errorHandler';
import systemRoutes from './routes/systemRoutes';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import { getPackageVersion } from './utils/packageInfo';

export function createApp() {
  const app = express();

  const originList = [
    process.env.CORS_ORIGIN_LOCAL,
    process.env.CORS_ORIGIN_PROD,
    process.env.CORS_ORIGIN_PROD_WWW,
    process.env.CORS_ORIGIN_DEV,
    process.env.CORS_ORIGIN_DEV_WWW,
  ].filter((origin): origin is string => !!origin);

  app.use(
    cors({
      origin: originList,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(passport.initialize());

  app.get('/', (_req: Request, res: Response) => {
    res.send(`Welcome to CS Quiz Server! 🚀 (v${getPackageVersion()})`);
  });

  app.use('/api/tracks', trackRoutes);
  app.use('/api/quiz', quizRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/system', systemRoutes);
  app.use('/api/auth', authRoutes);

  app.use(globalErrorHandler);

  return app;
}
