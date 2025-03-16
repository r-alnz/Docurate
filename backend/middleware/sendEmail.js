import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendEmail = async ({ email, firstname, lastname, password }) => {
  console.log("[sendEmail.js]:");
  console.log("\t📧 Sending email to:", email); // Debugging
  console.log("\t🔑 Password:", password); // Debugging

  if (!email) {
    console.error("❌ Error: Email is undefined or empty.");
    throw new Error("Recipient email is required.");
  }

  console.log(`📧 Sending email to: ${email}`); // Debugging

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
          to: email.trim(),
          subject: 'Test Email',
          html: `
              <h2>Hello, ${firstname} ${lastname}!</h2>
              <p>Your account has been set up successfully.</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> ${password}</p>
              <p>Please change your password after logging in.</p>
              <br>
              <p>Best Regards,</p>
              <p>Your Team</p>
          `
      };

      let info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.response);
  } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
  }
};

export default sendEmail;
