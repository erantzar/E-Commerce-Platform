import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import { sendVerificationEmailHTML, sendResetPasswordEmailHTML, sendTwoFactorEmailHTML, sendOrderEmailHTML, sendOrderStatusEmailHTML } from "./mailer.messeges.js";
dotenv.config();
// const order = await Order.create({
//   user: userId,
//   items: resolvedItems,
//   shippingAddress,
//   paymentMethod,
//   notes,
//   totalprice: (totalPrice + shipingCost),
// });
const transporter = nodemailer.createTransport({
    service: "gmail", // אפשר גם SMTP אחר
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
//when register
async function sendVerificationEmail(to, verificationLink) {
    await transporter.sendMail({
        from: `"Ecommerce" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Welcome! Please verify your email",
        text: `Welcome! Please verify your email by clicking this link: ${verificationLink}`,
        html: sendVerificationEmailHTML(verificationLink),
    });
}
async function sendResetPasswordEmail(to, resetLink) {
    await transporter.sendMail({
        from: `"Ecommerce" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Reset Your Password",
        text: `Reset your password by clicking this link: ${resetLink}`,
        html: sendResetPasswordEmailHTML(resetLink),
    });
}
//send verification fo admins
async function sendTwoFactorEmail(to, twoFactorCode) {
    await transporter.sendMail({
        from: `"Ecommerce" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Admin Login - Two Factor Authentication Code",
        text: `Your two factor authentication code is: ${twoFactorCode}`,
        html: sendTwoFactorEmailHTML(twoFactorCode),
    });
}
//send mail when order creates
//order: any אין לי מוסג צריכה ליבדוק
async function sendOrderEmail(order, to) {
    console.log(order, "hahah");
    await transporter.sendMail({
        from: `"Ecommerce" <${process.env.EMAIL_USER}>`,
        to,
        subject: `Order Confirmation #${order._id}`,
        html: sendOrderEmailHTML(order),
    });
}
//send mail when admin change order status
async function sendOrderStatusEmail(to, orderId, orderStatus) {
    await transporter.sendMail({
        from: `"Ecommerce" <${process.env.EMAIL_USER}>`,
        to,
        subject: `Order Update - #${orderId}`,
        text: `Your order #${orderId} status has been updated to: ${orderStatus}`,
        html: sendOrderStatusEmailHTML(orderId, orderStatus),
    });
}
export { sendVerificationEmail, sendResetPasswordEmail, sendTwoFactorEmail, sendOrderEmail, sendOrderStatusEmail };
//# sourceMappingURL=mailer.js.map