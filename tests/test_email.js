import sendEmail from "../utils/email.js";

const to = "jhon@example.com";
const subject = "Test Email";
const text = "This is a test email from Node.js!";

sendEmail(to, subject, text)
    .then(() => {
        console.log("Email sent successfully");
    })
    .catch((error) => {
        console.error("Error sending email:", error);
    });