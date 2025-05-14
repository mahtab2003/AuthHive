import { createItem, getItem, updateItem } from '../utils/rethinkdb.js';
import { generateHash, verifyHash } from '../utils/hash.js';
import { generateJwtToken } from '../utils/jwt.js';
import { sendEmail } from '../utils/email.js';
import { createToken as createVerificationToken } from '../utils/token.js';
import { verifyCsrfToken, createCsrfToken } from '../utils/csrf.js';
import { verifyRecaptcha } from '../utils/recaptcha.js';
import crypto from 'crypto';

const USERS_TABLE = 'users';
const TOKENS_TABLE = 'verification_tokens';
const LOGS_TABLE = 'logs';
const ADMINS_TABLE = 'admins';

const sanitize = (str) => String(str).replace(/[^a-zA-Z0-9@.]/g, ''); // Basic sanitization

export const signup = async (request, h) => {
    const { email, password, username, referredBy, csrfToken, recaptchaToken } = request.payload;
    const ip = request.info.remoteAddress;

    if (!await verifyCsrfToken(ip, csrfToken)) return h.response({ success: false, message: 'Invalid CSRF token' }).code(403);

    if (!await verifyRecaptcha(recaptchaToken)) return h.response({ success: false, message: 'Invalid reCAPTCHA token' }).code(400);
        
    const userExistsByEmail = await getItem(USERS_TABLE, { email: sanitize(email) });
    if (userExistsByEmail.length) return h.response({ success: false, message: 'User already exists' }).code(400);

    const userExistsByUsername = await getItem(USERS_TABLE, { username: sanitize(username) });
    if (userExistsByUsername.length) return h.response({ success: false, message: 'User already exists' }).code(400);

    const hashedPassword = await generateHash(password);

    await createItem(USERS_TABLE, {
        username: sanitize(username),
        email: sanitize(email),
        password: hashedPassword,
        verified: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deletedAt: null
    });
    
    await createItem(LOGS_TABLE, {
        action: 'signup',
        email: sanitize(email),
        ip,
        userAgent: request.headers['user-agent'],
        createdAt: Date.now()
    });

    return h.response({ success: true, message: 'Signup successful. Please verify your email.' });
};

export const login = async (request, h) => {
    const { email, password, role, csrfToken, recaptchaToken } = request.payload;
    const ip = request.info.remoteAddress;

    if (!await verifyCsrfToken(ip, csrfToken)) return h.response({ success: false, message: 'Invalid CSRF token' }).code(403);

    if (!await verifyRecaptcha(recaptchaToken)) return h.response({ success: false, message: 'Invalid reCAPTCHA token' }).code(400);
        
    if (role !== 'user' && role !== 'admin') {
        return h.response({ success: false, message: 'Invalid role' }).code(400);
    }

    if (role === 'admin' || role == 'admin') {
        const adminUser = await getItem(ADMINS_TABLE, { email: sanitize(email), role: 'admin', deletedAt: null });
        if (!adminUser.length) {
            return h.response({ success: false, message: 'Invalid credentials' }).code(401);
        }
        const admin = adminUser[0];
        if (!(await verifyHash(password, admin.password))) {
            return h.response({ success: false, message: 'Invalid credentials' }).code(401);
        }
        const token = generateJwtToken({ id: admin.id, email: admin.email, role: 'admin' });
        await createItem(LOGS_TABLE, {
            action: 'admin_login',
            email: sanitize(email),
            ip,
            userAgent: request.headers['user-agent'],
            createdAt: Date.now()
        });
        return h.response({ token, user: {
            id: admin.id,
            email: admin.email,
            name: admin.username,
            role: 'admin',
        }});
    }
    
    const users = await getItem(USERS_TABLE, { email: sanitize(email), deletedAt: null });
    const user = users[0];

    if (!user || !(await verifyHash(password, user.password))) {
        return h.response({ success: false, message: 'Invalid credentials' }).code(401);
    }

    if (!user.verified) {
        return h.response({ success: false, message: 'Please verify your email first' }).code(403);
    }

    const token = generateJwtToken({ id: user.id, email: user.email, role: 'user' });

    await createItem(LOGS_TABLE, {
        action: 'login',
        email: sanitize(email),
        ip,
        userAgent: request.headers['user-agent'],
        createdAt: Date.now()
    });

    return h.response({ token, user: {
        id: user.id,
        email: user.email,
        name: user.username,
        role: 'user',
        verified: user.verified
    }});
};

export const forgotPassword = async (request, h) => {
    const { email, csrfToken, recaptchaToken } = request.payload;
    const ip = request.info.remoteAddress;

    if (!await verifyCsrfToken(ip, csrfToken)) return h.response({ success: false, message: 'Invalid CSRF token' }).code(403);

    if (!await verifyRecaptcha(recaptchaToken)) return h.response({ success: false, message: 'Invalid reCAPTCHA token' }).code(400);
        
    const token = createVerificationToken();
    await createItem(TOKENS_TABLE, {
        email: sanitize(email),
        token,
        type: 'password-reset',
        used: false,
        createdAt: Date.now()
    });

    await sendEmail(email, 'Password Reset', `Your reset token is: ${token}`);

    await createItem(LOGS_TABLE, {
        action: 'forgot_password',
        email: sanitize(email),
        ip,
        userAgent: request.headers['user-agent'],
        createdAt: Date.now()
    });

    return h.response({ success: true, message: 'Password reset token sent to your email' });
};

export const resetPassword = async (request, h) => {
    const { email, token, newPassword, csrfToken, recaptchaToken } = request.payload;
    const ip = request.info.remoteAddress;

    if (!await verifyCsrfToken(ip, csrfToken)) return h.response({ success: false, message: 'Invalid CSRF token' }).code(403);

    if (!await verifyRecaptcha(recaptchaToken)) return h.response({ success: false, message: 'Invalid reCAPTCHA token' }).code(400);
        
    const tokens = await getItem(TOKENS_TABLE, { email: sanitize(email), token, type: 'password-reset', used: false });
    if (!tokens.length) return h.response({ success: false, message: 'Invalid or expired token' }).code(400);

    const hashed = await generateHash(newPassword);
    await updateItem(USERS_TABLE, {
        password: hashed,
        updatedAt: Date.now()
    }, { email: sanitize(email) });

    await updateItem(TOKENS_TABLE, { used: true }, { email: sanitize(email), token });

    await createItem(LOGS_TABLE, {
        action: 'reset_password',
        email: sanitize(email),
        ip,
        userAgent: request.headers['user-agent'],
        createdAt: Date.now()
    });

    return h.response({ success: true, message: 'Password reset successful' });
};

export const sendVerificationToken = async (request, h) => {
    const { email, csrfToken } = request.payload;
    const ip = request.info.remoteAddress;

    if (!await verifyCsrfToken(ip, csrfToken)) return h.response({ success: false, message: 'Invalid CSRF token' }).code(403);

    const token = createVerificationToken();
    
    await createItem(TOKENS_TABLE, {
        email: sanitize(email),
        token,
        type: 'email-verification',
        used: false,
        createdAt: Date.now(),
        expireAt: Date.now() + 3600000 // 1 hour expiration
    });

    await sendEmail(email, 'Email Verification', `Your verification token is: ${token}`);

    await createItem(LOGS_TABLE, {
        action: 'send_verification_token',
        email: sanitize(email),
        ip,
        userAgent: request.headers['user-agent'],
        createdAt: Date.now()
    });

    return h.response({ success: true, message: 'Verification token sent to your email' });
};

export const verifyToken = async (request, h) => {
    const { email, token, csrfToken, recaptchaToken } = request.payload;
    const ip = request.info.remoteAddress;

    if (!await verifyCsrfToken(ip, csrfToken)) return h.response({ success: false, message: 'Invalid CSRF token' }).code(403);

    if (!await verifyRecaptcha(recaptchaToken)) return h.response({ success: false, message: 'Invalid reCAPTCHA token' }).code(400);
        
    const tokens = await getItem(TOKENS_TABLE, { email: sanitize(email), token, type: 'email-verification', used: false });
    if (!tokens.length) return h.response({ success: false, message: 'Invalid or expired token' }).code(400);
    if (tokens[0].expireAt < Date.now()) return h.response({ success: false, message: 'Token expired' }).code(400);

    await updateItem(USERS_TABLE, { verified: true, updatedAt: Date.now() }, { email: sanitize(email) });
    await updateItem(TOKENS_TABLE, { used: true }, { email: sanitize(email), token });

    await createItem(LOGS_TABLE, {
        action: 'verify_email',
        email: sanitize(email),
        ip,
        userAgent: request.headers['user-agent'],
        createdAt: Date.now()
    });

    return h.response({ success: true, message: 'Email verified successfully' });
};

export const generateCsrfToken = async (request, h) => {
    const ip = request.info.remoteAddress; // Get the user's IP for CSRF validation

    // Generate CSRF token and store it
    const token = await createCsrfToken(ip);

    // Return the CSRF token in the response
    return h.response({ success: true, csrfToken: token }).code(200);
};

export default {
    signup,
    login,
    forgotPassword,
    resetPassword,
    sendVerificationToken,
    verifyToken,
    generateCsrfToken
}