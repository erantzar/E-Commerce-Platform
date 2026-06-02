import express from "express";
import type { Router } from "express";
import { getDashboardStats } from "./stats.controller.js";
import { authMiddleware, checkRole } from "../auth/auth.middleware.js";

const statsRoutes: Router = express.Router();

statsRoutes.get("/dashboard", authMiddleware, checkRole, getDashboardStats);

export default statsRoutes;