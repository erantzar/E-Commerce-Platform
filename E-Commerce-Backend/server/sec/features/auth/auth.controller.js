import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import User from "../users/user.model.js";
import dotenv from "dotenv"
import { sendVerificationEmail, linkAndEmail } from "../../utils/mailer.js";
dotenv.config()
import crypto from "crypto";



 function generateCode() {
     return Math.floor(100000 + Math.random() * 900000).toString();
 }


export const register = async (req, res) => {
    
    try {
        const { name, email, password } = req.body
        console.log(email);
        
        const hashed = await bcrypt.hash(password, 10)
        console.log(hashed);
        
        const rawToken = crypto.randomBytes(32).toString("hex");
        console.log(rawToken);
        
        const user = await User.create({
            name,
            email,
            verificationToken: rawToken,
            password: hashed
        })
        
        const link = `http://localhost:3000/verify-email/${rawToken}`;

        await sendVerificationEmail(email, link)

        res.status(200).json({
            status: 200,
            message: "Verification code sent.",
            data: user
        })
    } catch (error) {
        const { code, keyValue } = error
        console.log(code, keyValue)
        if (String(code) === "11000") {
            const { email } = keyValue
            if (email) {
                return res.status(400).json({
                    status: 400,
                    message: "Cannot register with this email",
                    data: null
                })
            }
        }
        console.error("DEBUG ERROR:", error);
        res.status(500).json({
            status: 500,
            message: "Failed register a new user",
            data: null
        })
    }
}

export async function verifyEmail(req, res) {
    try {

        const { rawToken } = req.params;

        const user = await User.findOne({ verificationToken:rawToken });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.verificationToken !== rawToken) {
            return res.status(400).json({ message: "Invalid rawToken" });
        }

        user.isVerified = true;
        user.verificationToken = null;

        await user.save();

        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({
                status: 400,
                message: "Invalid credentials",
                data: null
            });
        }

        if (!user.isVerified) {
            return res.status(400).json({
                status: 400,
                message: "User is not verified",
                data: null
            });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({
                status: 400,
                message: "Invalid credentials",
                data: null
            });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "30m" }
        );

        return res.status(200).json({
            status: 200,
            message: "Login successfully",
            data: token
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            data: null
        });
    }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    // יוצרים טוקן רנדומלי
    const rawToken = crypto.randomBytes(32).toString("hex");

    // יוצרים hash לשמירה במסד
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // שומרים במסד
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = Date.now() + 1000 * 60 * 15; // 15 דקות
    await user.save();

    // שולחים למייל את הטוקן המקורי
    const link = `http://localhost:3000/reset-password/${rawToken}`;

    await linkAndEmail(email, link);

    return res.status(200).json({
      status: 200,
      message: "Reset link sent successfully",
      data: link,
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
      data: null,
    });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: 400,
        message: "Password is required",
        data: null,
      });
    }

    // יוצרים hash לטוקן שהגיע מהלינק
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // מחפשים משתמש עם טוקן תקף
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });
 
    if (!user) {
      return res.status(400).json({
        status: 400,
        message: "Token invalid or expired",
        data: null,
      });
    }

    // מצפינים סיסמה חדשה
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    // מוחקים את הטוקן
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      status: 200,
      message: "Password reset successfully",
      data: null,
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
      data: null,
    });
  }
};

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password"); // צריך סיסמה
        if (!user || user.role !== "admin") {
            return res.status(400).json({
                status: 400,
                message: "Invalid admin credentials",
                data: null
            });
        }

        if (!user.isVerified) {
            return res.status(400).json({
                status: 400,
                message: "Admin email not verified",
                data: null
            });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({
                status: 400,
                message: "Invalid admin credentials",
                data: null
            });
        }

        // יוצרים קוד 2FA רנדומלי
        const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
        const twoFactorExpiry = Date.now() + 1000 * 60 * 5; // 5 דקות תוקף

        user.twoFactorCode = twoFactorCode;
        user.twoFactorExpiry = twoFactorExpiry;
        await user.save();
        await sendVerificationEmail(email, twoFactorCode);
        // שולחים את הקוד למייל או SMS
        // כאן אפשר להשתמש בפונקציה קיימת כמו sendVerificationEmail
        // sendVerificationEmail(user.email, `Your 2FA code is: ${twoFactorCode}`)

        res.status(200).json({
            status: 200,
            message: "2FA code sent to admin email",
            data: { userId: user._id } // נשתמש ב־userId כדי לאמת 2FA בהמשך
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            data: null
        });
    }
};

export const verify2FA = async (req, res) => {
    try {
        const { userId, code } = req.body;

        if (!userId || !code) {
            return res.status(400).json({
                status: 400,
                message: "userId and code are required",
                data: null
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "Admin not found",
                data: null
            });
        }

        if (!user.twoFactorCode || !user.twoFactorExpiry || user.twoFactorExpiry < Date.now()) {
            return res.status(400).json({
                status: 400,
                message: "2FA code expired or invalid",
                data: null
            });
        }

        if (user.twoFactorCode !== code) {
            return res.status(400).json({
                status: 400,
                message: "Invalid 2FA code",
                data: null
            });
        }

        // הכל תקין → יוצרים JWT סופי
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" } // אפשר לשנות לפי הצורך
        );

        // מנקים את שדות ה-2FA
        user.twoFactorCode = null;
        user.twoFactorExpiry = null;
        await user.save();

        res.status(200).json({
            status: 200,
            message: "2FA verified successfully",
            data: { token }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            data: null
        });
    }
};
export const getMe = async (req, res) => {
        try{
          const {userId} = req.user
              const user = await User.findById(userId);
          if (!user) throw new Error("User not found");
          res.status(200).json({
            status: 200,
            message: "User fetched successfully",
            data: user
        })
        }catch(error){
          console.log("User not found")
          console.log(error);
          res.status(400).json({
            status: 400,
            message: error.message || error,
            data: null
        })
        }
      };
