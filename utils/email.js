import { mailer } from '../config/index.js';

export const sendEmail = async (to, subject, text) => {
    try {
        const info = await mailer.sendMail({
            from: (process.env.SMTP_NAME || "Node Mailer") + ' <' + (process.env.SMTP_USER) + '>',
            to,
            subject,
            text,
        });
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

export default sendEmail;