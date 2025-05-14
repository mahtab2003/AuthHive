import '../config/envConfig.js'; // Ensure environment variables are loaded
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRATION || '7d'; // You can change to '1h', '7d', etc.

// Generate JWT Token
export function generateJwtToken(payload, options = {}) {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
      ...options
    });
    return token;
  } catch (err) {
    console.error('Error generating JWT token:', err);
    return null;
  }
}

// Verify JWT Token
export function verifyJwtToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    console.error('Invalid or expired JWT token:', err);
    return null;
  }
}
