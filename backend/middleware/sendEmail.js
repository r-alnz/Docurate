import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendEmail = async ({ email, firstname, lastname, studentId, birthdate, role }) => {
  console.log("[sendEmail.js]:");
  console.log("\t📧 Sending email to:", email);
  console.log("\t📅 Birthdate received:", birthdate);
  console.log("\t👤 Role:", role);

  if (!email) {
    console.error("❌ Error: Email is undefined or empty.");
    throw new Error("Recipient email is required.");
  }

  // Remove spaces from lastname (e.g., "De Guzman" → "DeGuzman")
  const formattedLastname = lastname ? lastname.replace(/\s+/g, '') : '';

  // Extract birth year correctly
  let birthYear = '';
  if (birthdate) {
    try {
      const birthdateObj = new Date(birthdate);
      if (!isNaN(birthdateObj.getTime())) {
        birthYear = birthdateObj.getFullYear().toString();
        console.log("\t🎂 Extracted birth year:", birthYear);
      } else {
        console.error("❌ Invalid birthdate format:", birthdate);
      }
    } catch (error) {
      console.error("❌ Error parsing birthdate:", error);
    }
  } else {
    console.log("⚠️ No birthdate provided for user");
  }

  // 🔹 Fix: Always use birthYear if available, even for non-superadmins
  let defaultPassword;
  if (birthYear) {
    defaultPassword = `${formattedLastname}${birthYear}`;
  } else {
    defaultPassword = `${formattedLastname}${studentId || ''}`;
  }

  // Debugging log
  console.log("\t🔐 Final Default Password:", defaultPassword);

  try {
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
        <p>Docurate</p>
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
