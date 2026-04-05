declare function sendVerificationEmail(to: string, verificationLink: string): Promise<void>;
declare function sendResetPasswordEmail(to: string, resetLink: string): Promise<void>;
declare function sendTwoFactorEmail(to: string, twoFactorCode: string): Promise<void>;
declare function sendOrderEmail(order: any, to: string): Promise<void>;
declare function sendOrderStatusEmail(to: string, orderId: string, orderStatus: string): Promise<void>;
export { sendVerificationEmail, sendResetPasswordEmail, sendTwoFactorEmail, sendOrderEmail, sendOrderStatusEmail };
//# sourceMappingURL=mailer.d.ts.map