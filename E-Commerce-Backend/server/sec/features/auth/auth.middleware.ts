import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { Request, Response, NextFunction } from "express";
import User from "../users/user.model.js";

dotenv.config()
interface JwtPayload {
  userId: string;
  role?: string;
}
declare global {
  namespace Express {
      interface Request {
          user?: {
              id: string;
          };
      }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void | Response => {
    const authHeader = req.headers.authorization;
    // console.log(authHeader)

    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({
            status: 401,
            message: "No token provided",
            data: null
        })
    }

    const token = authHeader.split(" ")[1]
    // console.log(token)
    try {
      
      // וודאי שבתחילת הפונקציה יש בדיקה כזו:
        if (!token) {
          res.status(401).json({ message: "No token" });
          return;
        }

// עכשיו, כש-TS יודע ש-token חייב להיות קיים, השתמשי בסימן קריאה:
        const decoded = jwt.verify(token!, process.env.JWT_SECRET!) as unknown as JwtPayload;       // Decoded - includes the user unique key of the token registration
        req.user = {
            // ...req.user,
            id: decoded.userId
        }
        next()
    } catch (error) {
        // console.log(error)
        res.status(401).json({
            status: 401,
            message: "Token is invalid",
            data: null
        })
    }
}

export const checkPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id: userIdFromToken } = req.user!;
  const { id: userIdFromUrl } = req.params;

  if (String(userIdFromToken) !== String(userIdFromUrl)) {
    res.status(401).json({
      status: 401,
      message: "No permission",
      data: null,
    });
    return;
  }
  next();
};

export const checkRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = await User.findById(req.user!.id).select("role").lean() as { role?: string } | null;

  if (!user || user.role !== "admin") {
    res.status(403).json({ message: "Access denied" });
    return;
  }
  next();
};