import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../types/auth';
import { wrongAnswerService } from '../services/wrongAnswerService';
import logger from '../utils/logger';

function requireUser(req: AuthRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: 'User authentication failed' });
    return null;
  }
  return req.user.user_id;
}

export const wrongAnswerController = {
  list: asyncHandler(async function (req: AuthRequest, res: Response) {
    const userId = requireUser(req, res);
    if (userId == null) return;

    const trackId = req.query.trackId ? Number(req.query.trackId) : undefined;
    const data = await wrongAnswerService.list(
      userId,
      trackId && !Number.isNaN(trackId) ? trackId : undefined
    );
    res.json({ status: 'success', count: data.length, data });
  }),

  merge: asyncHandler(async function (req: AuthRequest, res: Response) {
    const userId = requireUser(req, res);
    if (userId == null) return;

    const { trackId, questionIds } = req.body || {};
    if (!trackId || !Array.isArray(questionIds)) {
      return res.status(400).json({ message: 'trackId and questionIds[] required' });
    }

    const data = await wrongAnswerService.merge(
      userId,
      Number(trackId),
      questionIds.map(Number)
    );
    logger.info(`Merged wrong answers user=${userId} track=${trackId} count=${data.length}`);
    res.json({ status: 'success', count: data.length, data });
  }),

  clearTrack: asyncHandler(async function (req: AuthRequest, res: Response) {
    const userId = requireUser(req, res);
    if (userId == null) return;

    const trackId = Number(req.query.trackId || req.body?.trackId);
    if (!trackId || Number.isNaN(trackId)) {
      return res.status(400).json({ message: 'trackId required' });
    }

    const deleted = await wrongAnswerService.clearTrack(userId, trackId);
    res.json({ status: 'success', deletedCount: deleted });
  }),
};
