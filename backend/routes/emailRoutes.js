import express from 'express';
import sendEmail from '../middleware/sendEmail.js';

const router = express.Router();

router.post('/send', async (req, res) => {
    // Force test email for now
    const testEmail = 'paulgapud@gmail.com';

    try {
        await sendEmail(testEmail);
        res.status(200).json({ message: `Email sent to ${testEmail}` });
    } catch (error) {
        console.error("Email sending failed:", error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

export default router;
