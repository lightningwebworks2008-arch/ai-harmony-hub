import crypto from 'crypto';

/**
 * Get encryption key from environment
 * This key is used to encrypt platform API keys before storing in database
 */
export function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt data using AES-256-GCM
 * @param plaintext - The data to encrypt
 * @param key - 32-byte encryption key
 * @returns Object with ciphertext, iv, and authTag
 */
export function encrypt(
  plaintext: string,
  key: Buffer
): {
  ciphertext: string;
  iv: string;
  tag: string;
} {
  // Generate random IV (initialization vector)
  const iv = crypto.randomBytes(16);
  
  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  // Encrypt
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  
  // Get authentication tag
  const tag = cipher.getAuthTag();
  
  return {
    ciphertext,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
}

/**
 * Decrypt data using AES-256-GCM
 * @param ciphertext - The encrypted data
 * @param iv - Initialization vector
 * @param tag - Authentication tag
 * @param key - 32-byte encryption key
 * @returns Decrypted plaintext
 */
export function decrypt(
  ciphertext: string,
  iv: string,
  tag: string,
  key: Buffer
): string {
  // Create decipher
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'hex')
  );
  
  // Set auth tag
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  // Decrypt
  let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
  plaintext += decipher.final('utf8');
  
  return plaintext;
}