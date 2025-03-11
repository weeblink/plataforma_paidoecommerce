import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

const isAuth = ( req: Request, res: Response, next: NextFunction ) => {
    const authHeader = req.headers.authorization;

    if( !authHeader ) throw new AppError('INVALID_SESSION', 401);

    if( authHeader !== process.env.MIDDLEWARE_TOKEN )
        throw new AppError("INVALID_TOKEN", 401);

    return next();
}

export default isAuth;