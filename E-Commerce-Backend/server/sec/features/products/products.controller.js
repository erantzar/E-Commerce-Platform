import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { User } from "../models/User.js"
import dotenv from "dotenv"

dotenv.config()

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        const hashed = await bcrypt.hash(password, 10)
        const user = await User.create({ name, email, password: hashed })

        res.status(201).json({
            status: 201,
            message: "User created successfuly",
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