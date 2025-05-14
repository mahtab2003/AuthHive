import fetch from 'node-fetch';
import recaptcha from '../config/recaptcha.js';  

export async function verifyRecaptcha(token, remoteIp = '') {

    if (!recaptcha.secretKey) {
        console.error('reCAPTCHA secret key is missing in environment variables.');
        return { success: false, message: 'reCAPTCHA config missing' };
    }

    try {
        const params = new URLSearchParams();
        params.append('secret', recaptcha.secretKey);
        params.append('response', token);
        if (remoteIp) params.append('remoteip', remoteIp);

        const response = await fetch(recaptcha.verifyURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        });

        const data = await response.json();

        if (!data.success) {
            console.warn('reCAPTCHA failed:', data['error-codes']);
            return {
                success: false,
                message: 'reCAPTCHA failed',
                errorCodes: data['error-codes']
            };
        }

        return {
            success: true,
            score: data.score // For reCAPTCHA v3 only
        };
    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        return { success: false, message: 'Verification error' };
    }
}

export default verifyRecaptcha;