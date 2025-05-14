import crypto from 'crypto';
import actions from './rethinkdb.js';

const TABLE_NAME = 'csrf_tokens';
const TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

// Create or Update CSRF Token for an IP
export async function createCsrfToken(ipAddress) {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const expiresAt = now + TOKEN_EXPIRY_MS;

  // Check if there's an existing token for this IP
  const existing = await actions.getItem(TABLE_NAME, { ipAddress });

  if (existing && existing.length > 0) {
    // Update existing token
    await actions.updateItem(TABLE_NAME, {
      token,
      expiresAt,
      updatedAt: now,
      verified: false,
    }, { ipAddress });
  } else {
    // Create new token
    await actions.createItem(TABLE_NAME, {
      ipAddress,
      token,
      expiresAt,
      createdAt: now,
      verified: false,
    });
  }

  return token;
}

// Verify CSRF Token and update it
export async function verifyCsrfToken(ipAddress, token) {
  const results = await actions.getItem(TABLE_NAME, { ipAddress, token });

  if (!results || results.length === 0) return false;

  const { expiresAt } = results[0];
  if (Date.now() > expiresAt) return false;

  // Mark token as verified and refresh
  const newToken = crypto.randomBytes(32).toString('hex');
  await actions.updateItem(TABLE_NAME, {
    token: newToken,
    expiresAt: Date.now() + TOKEN_EXPIRY_MS,
    verified: true,
    updatedAt: Date.now(),
  }, { ipAddress });

  return true;
}

// 🧹 Clean expired tokens (optional maintenance)
export async function cleanExpiredTokens() {
  try {
    const expiredTokens = await actions.getItem(TABLE_NAME, r => r('expiresAt').lt(Date.now()));
    for (const token of expiredTokens) {
      await actions.updateItem(TABLE_NAME, { expired: true }, { ipAddress: token.ipAddress });
    }
  } catch (error) {
    console.error('Error cleaning expired CSRF tokens:', error);
  }
}
