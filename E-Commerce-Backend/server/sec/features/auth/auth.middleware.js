import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import User from "../users/user.model.js"

dotenv.config()

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({
            status: 401,
            message: "No token provided",
            data: null
        })
    }

    const token = authHeader.split(" ")[1]
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        
        req.user = {
            ...decoded//userId,email
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
export const checkPermissions = async (req, res, next) => {
    const { id: userIdFromToken } = req.user
    const { id: userIdFromUrl } = req.params

    if (String(userIdFromToken) !== String(userIdFromUrl)) {
        return res.status(401).json({
            status: 401,
            message: `No permission`,
            data: null
        })
    }
    next();
}
export const checkRole = async (req, res, next) => {
    const user = await User.findById(req.user.userId).select("role");
    const { role } = user;

    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
}
