import { Request } from 'express';
import { UserRow } from './user';

export interface AuthRequest extends Request {
    user?: UserRow;
}