import {Request, Response, NextFunction} from 'express';

// 비동기 함수 에러시 next() 
export const asyncHandler = (fn: Function) =>{
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    }
}