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

const sendOrderEmail = async (order, userEmail) => {
    
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  
    //יצירת רשימת המוצרים ב-HTML
    const itemsHtml = order.items.map(item => `
      <div style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; align-items: center;">
        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 15px; border-radius: 4px;">
        <div style="flex-grow: 1;">
          <h4 style="margin: 0;">${item.name}</h4>
          <p style="margin: 0; color: #666;">Quantity: ${item.quantity} | Price: $${item.price}</p>
        </div>
        <div style="font-weight: bold;">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    `).join('');
  
    //תוכן האימייל המלא
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Order Confirmation</h2>
        <p>Hi there,</p>
        <p>Thank you for your order! Here are your order details:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Status:</strong> ${order.orderStatus}</p>
          <p><strong>Payment:</strong> ${order.paymentMethod} (${order.paymentStatus})</p>
        </div>
  
        <h3>Items:</h3>
        ${itemsHtml}
  
        <div style="margin-top: 20px; border-top: 2px solid #333; padding-top: 10px;">
          <p><strong>Shipping Cost:</strong> $${order.shipingCost.toFixed(2)}</p>
          <p style="font-size: 1.2em;"><strong>Total Price:</strong> $${order.totalprice.toFixed(2)}</p>
        </div>
  
        <div style="margin-top: 20px; font-size: 0.9em; color: #555;">
          <h3>Shipping Address:</h3>
          <p>${order.shippingAddress.street} ${order.shippingAddress.houseNumber}, ${order.shippingAddress.city}, ${order.shippingAddress.zip}</p>
        </div>
  
        <p style="text-align: center; margin-top: 30px; color: #999; font-size: 0.8em;">
          If you have any questions, please contact our support.
        </p>
      </div>
    `;
  
    //הגדרות המשלוח
    const mailOptions = {
      from: `"E-commerce" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Order Confirmation #${order._id}`,
      html: htmlContent,
    };
  
    
    try {
      await transporter.sendMail(mailOptions);
      console.log('Order email sent successfully');
    } catch (error) {
      console.error('Error sending order email:', error);
    }
  };
  
  

export { sendVerificationEmail ,linkAndEmail, sendOrderEmail}
