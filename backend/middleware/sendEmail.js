import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendEmail = async ({ email, firstname, lastname, studentId }) => {
  console.log("[sendEmail.js]:");
  console.log("\t📧 Sending email to:", email);
  
  if (!email) {
    console.error("❌ Error: Email is undefined or empty.");
    throw new Error("Recipient email is required.");
  }

  // Generate default password using lastname+studentId
  const defaultPassword = `${lastname}${studentId || ''}`;
  
  // Debug environment variables (remove in production)
  console.log("EMAIL_USER exists:", !!process.env.EMAIL_USER);
  console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

  try {
    // Create a more detailed transporter configuration
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      debug: true // Enable debug output
    });

    let mailOptions = {
      from: `"Doctor Web Application" <${process.env.EMAIL_USER}>`,
      to: email.trim(),
      subject: 'Docurate Account',
      html: `
        <h2>Hello, ${firstname} ${lastname}!</h2>
        <p>Your account has been set up successfully.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Default Password:</strong> ${defaultPassword}</p>
        <p>Please change your password after logging in.</p>
        <br>
        <p>Best Regards,</p>
        <p>Your Team</p>
      `
    };

    let info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

export default sendEmail;