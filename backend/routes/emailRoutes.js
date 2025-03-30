import express from 'express';
import sendEmail from '../middleware/sendEmail.js';

const router = express.Router();

router.post('/send', async (req, res) => {
    // Force test email for now
    // const testEmail = 'paulgapud@gmail.com';

    console.log("[emailRoutes.js]\nReceived email request:", req.body); // Debugging

    let { email, firstname, lastname, studentId } = req.body; // Get user details
    
    console.log("[emailRoutes.js]\n📧 Extracted values:", { email, firstname, lastname, studentId }); // Debugging

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
  }

    // if (!email || !firstname || !lastname || !password) {
    //   return res.status(400).json({ error: 'Missing required user details' });
    // }

    try {
        // await sendEmail(testEmail);
        // res.status(200).json({ message: `Email sent to ${testEmail}` });

        await sendEmail({ email, firstname, lastname, studentId });
        res.json({ success: true, message: `Email sent successfully! to ${email}` });
    } catch (error) {
        console.error("Email sending failed:", error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

export default router;
