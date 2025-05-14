import "./envConfig.js";

import nodemailer from 'nodemailer';


const mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

mailer.verify((error, success) => {
    if (error) {
        console.error('SMTP configuration error:', error);
    } else {
        console.log('SMTP configuration is valid.');
    }
});

export default mailer;