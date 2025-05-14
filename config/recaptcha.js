import './envConfig.js';

export const recaptcha = {
    secretKey: process.env.RECAPTCHA_SECRET_KEY,
    siteKey: process.env.RECAPTCHA_SITE_KEY,
    verifyURL: 'https://www.google.com/recaptcha/api/siteverify'
};

export default recaptcha;