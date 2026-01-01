const nodemailer = require('nodemailer');
const db = require('../config/db');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendNotification = async (userId, message, emailSubject, emailBody) => {
    try {
        // 1. Save to database
        await db.execute('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [userId, message]);

        // 2. Send Email
        // First get user email
        const [users] = await db.execute('SELECT email FROM users WHERE id = ?', [userId]);
        if (users.length > 0) {
            const userEmail = users[0].email;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: emailSubject,
                text: emailBody
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error sending email:', error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
    } catch (error) {
        console.error('Notification error:', error);
    }
};
