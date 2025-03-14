import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendEmail = async (recipientEmail) => {
  try {
      let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
          },
      });

      let mailOptions = {
          from: process.env.EMAIL_USER,
          to: recipientEmail,
          subject: 'Test Email',
          text: 'Hello! This is a test email from your Node.js app.',
      };

      let info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.response);
  } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
  }
};

export default sendEmail;
