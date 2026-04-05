import type { Request, Response, NextFunction } from "express";
interface HttpError extends Error {
    statusCode?: number;
    status?: string;
    code?: number | string;
    name: string;
    stack?: string;
}
export declare const globalErrorHandler: (err: HttpError, req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=errorConrtoller.d.ts.map