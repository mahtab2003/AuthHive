import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

// Generate a secure hash from a plain value
export async function generateHash(value) {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(value, salt);
    return hash;
  } catch (err) {
    console.error('Error generating hash:', err);
    return null;
  }
}

// Verify a plain value against a hash
export async function verifyHash(value, hashedValue) {
  try {
    return await bcrypt.compare(value, hashedValue);
  } catch (err) {
    console.error('Error verifying hash:', err);
    return false;
  }
}
