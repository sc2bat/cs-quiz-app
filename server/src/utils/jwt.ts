import jwt from 'jsonwebtoken';
import { UserRow } from '../types/user';

const SECRET_KEY = process.env.JWT_SECRET as string;

export function generateToken(user: UserRow) {
    const payload = {
        user_id: user.user_id,
        email: user.email,
        nickname: user.nickname,
        role: user.user_role,
    };
    // expire 2hour
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '2h' });
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return null;
    }
}
