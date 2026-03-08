import nodemailer from "nodemailer";
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
    service: "gmail", // אפשר גם SMTP אחר
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendVerificationEmail(to, twoFactorCode) {
    console.log();
    
    await transporter.sendMail({
        from: `"My App" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: "Your Verification Code",
        text: `Your verification code is: ${twoFactorCode}`,
        html: `<h2>Your verification code is:</h2>
           <h1>${twoFactorCode}</h1>`,
    });
}
async function linkAndEmail(to, link) {
    await transporter.sendMail({
        from: `"My App" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: "Forgot Password",
        text: `Forgot Password: ${link}`,
        html: `<h2>Forgot Password</h2>
           <h1>${link}</h1>`,
    });
}

export { sendVerificationEmail ,linkAndEmail}
