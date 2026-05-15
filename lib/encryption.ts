import crypto from 'crypto';

// AES-256-GCM requires a 32-byte key.
// Generate one: crypto.randomBytes(32).toString('hex')

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Resolves the encryption key at call time (not module load).
 * This allows the module to be imported during build when ENCRYPTION_KEY
 * is not available, while still enforcing the check at runtime.
 */
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'FATAL: ENCRYPTION_KEY environment variable is not set. Cannot start in production without encryption key.'
      );
    }
    console.warn(
      '[SECURITY] ENCRYPTION_KEY is not set. Using development fallback. NEVER deploy without setting ENCRYPTION_KEY.'
    );
    return '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  }
  return key;
}

/**
 * Encrypts a string using AES-256-GCM.
 * Returns a colon-separated string: iv:salt:tag:encryptedData
 */
export function encrypt(text: string): string {
  if (!text) return text;

  // Ensure key is exactly 32 bytes
  const key = crypto.scryptSync(getEncryptionKey(), 'salt', 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${salt.toString('hex')}:${tag.toString(
    'hex'
  )}:${encrypted}`;
}

/**
 * Decrypts a string encrypted by the `encrypt` function.
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText;

  const parts = encryptedText.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted text format');
  }

  const iv = Buffer.from(parts[0]!, 'hex');
  const tag = Buffer.from(parts[2]!, 'hex');
  const encrypted = parts[3]!;

  const key = crypto.scryptSync(getEncryptionKey(), 'salt', 32);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Masks a secret string to show only the first few characters.
 * Useful for displaying connected status in the UI without revealing the secret.
 */
export function maskSecret(secret: string, showChars = 4): string {
  if (!secret) return '';
  if (secret.length <= showChars) return '*'.repeat(8);
  return `${secret.substring(0, showChars)}${'*'.repeat(8)}`;
}
