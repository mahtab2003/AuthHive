import authHandler from '../handlers/auth.js';

export default [
    {
        method: 'GET',
        path: '/api/auth/csrf-token',
        handler: authHandler.generateCsrfToken,
    },
    {
        method: 'POST',
        path: '/api/auth/signup',
        handler: authHandler.signup,
    },
    {
        method: 'POST',
        path: '/api/auth/login',
        handler: authHandler.login,
    },
    {
        method: 'POST',
        path: '/api/auth/forgot-password',
        handler: authHandler.forgotPassword,
    },
    {
        method: 'POST',
        path: '/api/auth/reset-password',
        handler: authHandler.resetPassword,
    },
    {
        method: 'POST',
        path: '/api/auth/send-verification-token',
        handler: authHandler.sendVerificationToken,
    },
    {
        method: 'POST',
        path: '/api/auth/verify-token',
        handler: authHandler.verifyToken,
    },
];
