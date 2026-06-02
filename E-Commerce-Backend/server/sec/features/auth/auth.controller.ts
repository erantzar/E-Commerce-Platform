import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import User from "../users/user.model.js";
import dotenv from "dotenv";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendTwoFactorEmail,
} from "../../utils/mailer.js";
import crypto from "crypto";

dotenv.config();

/**
 * @desc    register new user
 * @route   POST AuthRoutes/register
 * @access  all users
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    const hashed = await bcrypt.hash(password, 10);

    const rawToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

    const user = await User.create({
      name,
      email,
      verificationToken: rawToken,
      password: hashed,
      verificationTokenExpiry,
    });

    const link = `http://localhost:3000/api/v1/AuthRoutes/verify-email/${rawToken}`;
    await sendVerificationEmail(email, link);
    console.log("http://localhost:3000/api/v1/AuthRoutes/verify-email/",`${rawToken}`);
    
    res.status(200).json({
      status: 200,
      message: "Verification code sent.",
      data: user,
    });
  } catch (error: unknown) {
    const mongoError = error as { code?: number; keyValue?: { email?: string } };
    if (String(mongoError.code) === "11000") {
      if (mongoError.keyValue?.email) {
        res.status(400).json({
          status: 400,
          message: "Cannot register with this email",
          data: null,
        });
        return;
      }
    }
    console.error("DEBUG ERROR:", error);
    res.status(500).json({
      status: 500,
      message: "Failed to register a new user",
      data: null,
    });
  }
};

/**
 * @desc    verify user email
 * @route   GET AuthRoutes/verify-email/:rawToken
 * @access  registered user
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { rawToken } = req.params;

    if (!rawToken || typeof rawToken !== 'string') {
        return res.status(400).json({ message: "Invalid token" });
    }

    const user = await User.findOne({
      verificationToken: rawToken!,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;

    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

/**
 * @desc    login user
 * @route   POST AuthRoutes/login
 * @access  confirmed user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  console.log("הגיע");
  console.log(req.body);
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(400).json({
        status: 400,
        message: "Invalid credentials",
        data: null,
      });
      return;
    }

    if (!user.isVerified) {
      res.status(400).json({
        status: 400,
        message: "User is not verified",
        data: null,
      });
      return;
    }

    const match = await bcrypt.compare(password, user.password as string);
    if (!match) {
      res.status(400).json({
        status: 400,
        message: "Invalid credentials",
        data: null,
      });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      status: 200,
      message: "Login successfully",
      data: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

/**
 * @desc    send link for reset password
 * @route   POST AuthRoutes/password-forgot
 * @access  confirmed user
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as { email: string };

    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
    await user.save();

     const link = `http://localhost:3001/password-reset/${rawToken}`;
    console.log(rawToken);
    await sendResetPasswordEmail(email, link);

    res.status(200).json({
      status: 200,
      message: "Reset link sent successfully",
      data: link,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({
      status: 500,
      message: err.message,
      data: null,
    });
  }
};

/**
 * @desc    reset password
 * @route   POST AuthRoutes/password-reset/:token
 * @access  confirmed user
 */
export const resetPassword = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { token } = req.params;
    const { password } = req.body as { password: string };

    if (!password) {
      res.status(400).json({
        status: 400,
        message: "Password is required",
        data: null,
      });
      return;
    }
    if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Invalid token" });
      }

    const hashedToken = crypto.createHash("sha256").update(token!).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({
        status: 400,
        message: "Token invalid or expired",
        data: null,
      });
      return;
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;

    await user.save();

    res.status(200).json({
      status: 200,
      message: "Password reset successfully",
      data: null,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({
      status: 500,
      message: err.message,
      data: null,
    });
  }
};

/**
 * @desc    admin login
 * @route   POST AuthRoutes/admin/login
 * @access  Admin
 */
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  console.log("הגיע");
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await User.findOne({ email }).select("+password");
    if (!user || user.role !== "admin") {
      res.status(400).json({
        status: 400,
        message: "Invalid admin credentials",
        data: null,
      });
      return;
    }

    if (!user.isVerified) {
      res.status(400).json({
        status: 400,
        message: "Admin email not verified",
        data: null,
      });
      return;
    }

    const match = await bcrypt.compare(password, user.password as string);
    if (!match) {
      res.status(400).json({
        status: 400,
        message: "Invalid admin credentials",
        data: null,
      });
      return;
    }

    const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
    const twoFactorExpiry = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes

    user.twoFactorCode = twoFactorCode;
    user.twoFactorExpiry = twoFactorExpiry;
    await user.save();

    await sendTwoFactorEmail(email, twoFactorCode);
    console.log("userId - " +user._id ,"twoFactorCode - "+twoFactorCode );
    
    res.status(200).json({
      status: 200,
      message: "2FA code sent to admin email",
      data: { userId: user._id ,twoFactorCode:twoFactorCode },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

/**
 * @desc    verify admin 2FA
 * @route   POST AuthRoutes/admin/verify-2fa
 * @access  Admin
 */
export const verify2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, code } = req.body as { userId: string; code: string };

    if (!userId || !code) {
      res.status(400).json({
        status: 400,
        message: "userId and code are required",
        data: null,
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        status: 404,
        message: "Admin not found",
        data: null,
      });
      return;
    }

    if (
      !user.twoFactorCode ||
      !user.twoFactorExpiry ||
      user.twoFactorExpiry < new Date()
    ) {
      res.status(400).json({
        status: 400,
        message: "2FA code expired or invalid",
        data: null,
      });
      return;
    }

    if (user.twoFactorCode !== code) {
      res.status(400).json({
        status: 400,
        message: "Invalid 2FA code",
        data: null,
      });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    user.twoFactorCode = null;
    user.twoFactorExpiry = null;
    await user.save();

    res.status(200).json({
      status: 200,
      message: "2FA verified successfully",
      data: { token },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

/**
 * @desc    get my user info
 * @route   GET AuthRoutes/me
 * @access  confirmed user
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.user as { id: string };
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    res.status(200).json({
      status: 200,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(400).json({
      status: 400,
      message: err.message || String(error),
      data: null,
    });
  }
};

/**
 * @desc    logout
 * @route   POST/PUT AuthRoutes/logout
 * @access  confirmed user
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.user as { id: string };
  try {
    const user = await User.findByIdAndUpdate(
      { _id: id },
      { verificationToken: null }
    );

    res.status(200).json({
      status: 200,
      message: "User logged out successfully",
      data: user,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(400).json({
      status: 400,
      message: err.message || String(error),
      data: null,
    });
  }
};