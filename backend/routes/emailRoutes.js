import express from 'express';
import sendEmail from '../middleware/sendEmail.js';

const router = express.Router();

router.post('/send', async (req, res) => {
    console.log("[emailRoutes.js]\nReceived email request:", req.body); // Debugging

    let { email, firstname, lastname, studentId, birthdate, role } = req.body; // Get user details including role and birthdate
    
    console.log("[emailRoutes.js]\n📧 Extracted values:", { 
      email, 
      firstname, 
      lastname, 
      studentId, 
      birthdate: birthdate || "Not provided", 
      role: role || "Not provided" 
    }); // Debugging

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
        await sendEmail({ 
          email, 
          firstname, 
          lastname, 
          studentId, 
          birthdate, 
          role 
        });
        res.json({ success: true, message: `Email sent successfully! to ${email}` });
    } catch (error) {
        console.error("Email sending failed:", error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

export default router;
