import crypto from 'crypto';

export function createToken(length = 48) {
  return crypto.randomBytes(length).toString('hex');
}

export default createToken;