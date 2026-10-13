import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../types/auth';
import { adminService } from '../services/adminService';

function handleServiceError(error: any, res: Response) {
  const status = error?.status || 500;
  return res.status(status).json({ message: error?.message || 'Admin error' });
}

export const adminController = {
  listTracks: asyncHandler(async (_req: AuthRequest, res: Response) => {
    const data = await adminService.listTracks();
    res.json({ status: 'success', data });
  }),
  createTrack: asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const data = await adminService.createTrack(req.body);
      res.status(201).json({ status: 'success', data });
    } catch (e) {
      return handleServiceError(e, res);
    }
  }),
  updateTrack: asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const data = await adminService.updateTrack(Number(req.params.trackId), req.body);
      res.json({ status: 'success', data });
    } catch (e) {
      return handleServiceError(e, res);
    }
  }),
  deleteTrack: asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const data = await adminService.deleteTrack(Number(req.params.trackId));
      res.json({ status: 'success', data });
    } catch (e) {
      return handleServiceError(e, res);
    }
  }),
  listCategories: asyncHandler(async (req: AuthRequest, res: Response) => {
    const trackId = Number(req.query.trackId);
    if (!trackId) return res.status(400).json({ message: 'trackId required' });
    const data = await adminService.listCategories(trackId);
    res.json({ status: 'success', data });
  }),
  createCategory: asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const data = await adminService.createCategory(req.body);
      res.status(201).json({ status: 'success', data });
    } catch (e) {
      return handleServiceError(e, res);
    }
  }),
  updateCategory: asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const data = await adminService.updateCategory(Number(req.params.categoryId), req.body);
      res.json({ status: 'success', data });
    } catch (e) {
      return handleServiceError(e, res);
    }
  }),
  deleteCategory: asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const data = await adminService.deleteCategory(Number(req.params.categoryId));
      res.json({ status: 'success', data });
    } catch (e) {
      return handleServiceError(e, res);
    }
  }),
  listQuestions: asyncHandler(async (req: AuthRequest, res: Response) => {
    const categoryId = Number(req.query.categoryId);
    if (!categoryId) return res.status(400).json({ message: 'categoryId required' });
    const data = await adminService.listQuestions(categoryId);
    res.json({ status: 'success', data });
  }),
  createQuestion: asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const data = await adminService.createQuestion(req.body);
      res.status(201).json({ status: 'success', data });
    } catch (e) {
      return handleServiceError(e, res);
    }
  }),
  updateQuestion: asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const data = await adminService.updateQuestion(Number(req.params.questionId), req.body);
      res.json({ status: 'success', data });
    } catch (e) {
      return handleServiceError(e, res);
    }
  }),
  deleteQuestion: asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const data = await adminService.deleteQuestion(Number(req.params.questionId));
      res.json({ status: 'success', data });
    } catch (e) {
      return handleServiceError(e, res);
    }
  }),
};
