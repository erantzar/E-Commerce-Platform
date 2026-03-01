import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { User } from "../models/User.js"
import dotenv from "dotenv"
import { sendVerificationEmail } from "../utils/mailer.js"

dotenv.config()

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        const hashed = await bcrypt.hash(password, 10)

        const code = generateCode()

        const user = await User.create({
            name,
            email,
            verificationCode: code,
            password: hashed
        })

        await sendVerificationEmail(email, code)

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
                return res.status(500).json({
                    status: 500,
                    message: "Cannot register with this email",
                    data: null
                })
            }
        }
        res.status(500).json({
            status: 500,
            message: "Failed register a new user",
            data: null
        })
    }
}

export async function verifyEmail(req, res) {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({ message: "Invalid code" });
        }

        user.isVerified = true;
        user.verificationCode = null;

        await user.save();

        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({
            status: 400,
            message: "Invalid credentials",
            data: null
        })

        const match = await bcrypt.compare(password, user.password)
        if (!match) return res.status(400).json({
            status: 400,
            message: "Invalid credentials",
            data: null
        })

        if (!user.isVerified) return res.status(400).json({
            status: 400,
            message: "User is not verified",
            data: null
        })

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "30m" }
        )

        res.status(200).json({
            status: 200,
            message: "Login successfully",
            data: token
        })
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Failed register a new user",
            data: null
        })
    }
}