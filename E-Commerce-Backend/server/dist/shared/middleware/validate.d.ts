import type { Request, Response, NextFunction } from "express";
import type { ObjectSchema } from "joi";
type RequestProperty = "body" | "params" | "query";
export declare const validate: (schema: ObjectSchema, property?: RequestProperty) => (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validate.d.ts.map