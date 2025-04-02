import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const sendEmail = async ({ email, firstname, lastname, studentId, birthdate, role }) => {
  console.log("[sendEmail.js]:")
  console.log("\t📧 Sending email to:", email)
  console.log("\t📅 Birthdate received:", birthdate)
  console.log("\t👤 Role:", role)

  if (!email) {
    console.error("❌ Error: Email is undefined or empty.")
    throw new Error("Recipient email is required.")
  }

  // Remove spaces from lastname (e.g., "Dela Cruz" → "DelaCruz")
  const formattedLastname = lastname ? lastname.replace(/\s+/g, "") : ""
  const formattedFirstname = firstname ? firstname.replace(/\s+/g, "") : ""
  // Extract birth year correctly
  let birthYear = ""
  if (birthdate) {
    try {
      const birthdateObj = new Date(birthdate)
      if (!isNaN(birthdateObj.getTime())) {
        birthYear = birthdateObj.getFullYear().toString()
        console.log("\t🎂 Extracted birth year:", birthYear)
      } else {
        console.error("❌ Invalid birthdate format:", birthdate)
      }
    } catch (error) {
      console.error("❌ Error parsing birthdate:", error)
    }
  } else {
    console.log("⚠️ No birthdate provided for user")
  }

  // Declare defaultPassword variable
  let defaultPassword = ""

  // 🔹 Role for setting the default password - use role parameter directly
   // Restore the original conditional logic for default password with three conditions
   if (role === "admin") {
     // For admin: lastname + birthYear
     defaultPassword = `${formattedLastname}${birthYear}`
   } else if (role === "student") {
     // For student: lastname + studentId
     defaultPassword = `${formattedLastname}${studentId || ""}`
   } else if (role === "organization") {
     // For organization: firstname + "@"
     defaultPassword = `${formattedFirstname}@`
   } else {
     // Default fallback for any other roles
     defaultPassword = `${formattedLastname}${studentId || birthYear || ""}`
   }
 

  // Debugging log
  console.log("\t🔐 Final Default Password:", defaultPassword)

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      debug: true, // Enable debug output
    })

    const mailOptions = {
      from: `"Doctor Web Application" <${process.env.EMAIL_USER}>`,
      to: email.trim(),
      subject: "Docurate Account",
      html: `
        <h2>Hello, ${firstname} ${lastname}!</h2>
        <p>Your account has been set up successfully.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Default Password:</strong> ${defaultPassword}</p>
        <p>Please change your password after logging in.</p>
        <br>
        <p>Best Regards,</p>
        <p>Docurate</p>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("✅ Email sent:", info.response)
    return info
  } catch (error) {
    console.error("❌ Error sending email:", error)
    throw error
  }
}

export default sendEmail

