// Cryptographic Utilities - Web Crypto API Hashing, Password Strength & Token Generation

/**
 * Converts ArrayBuffer to Hex String
 */
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converts Hex String to Uint8Array
 */
function hexToBuffer(hex) {
  const bytes = new Uint8Array(Math.ceil(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Generates a cryptographically secure random salt hex string
 */
export function generateSalt(length = 16) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return bufferToHex(array);
}

/**
 * Generates a cryptographically secure random token (single-use reset tokens, session IDs)
 */
export function generateSecureToken(length = 32) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return bufferToHex(array);
}

/**
 * Generates 8 single-use 2FA backup recovery codes in format XXXX-XXXX
 */
export function generateBackupRecoveryCodes(count = 8) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const arr = new Uint8Array(4);
    crypto.getRandomValues(arr);
    const hex = bufferToHex(arr).toUpperCase();
    codes.push(`${hex.substring(0, 4)}-${hex.substring(4, 8)}`);
  }
  return codes;
}

/**
 * Derives PBKDF2-SHA256 password hash using Web Crypto API
 * Never stores plain text passwords
 */
export async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: hexToBuffer(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  return bufferToHex(derivedBits);
}

/**
 * Verifies a password against a stored hash and salt
 */
export async function verifyPassword(password, storedHash, storedSalt) {
  if (!password || !storedHash || !storedSalt) return false;
  try {
    const computedHash = await hashPassword(password, storedSalt);
    return computedHash === storedHash;
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

/**
 * Comprehensive Password Strength Evaluator
 * Validates: Minimum 12 characters, uppercase, lowercase, number, special character
 */
export function evaluatePasswordStrength(password = '') {
  const checks = {
    length: password.length >= 12,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)
  };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (checks.length) score += 1;
  if (checks.hasUpper && checks.hasLower) score += 1;
  if (checks.hasNumber) score += 1;
  if (checks.hasSpecial) score += 1;

  let label = 'Weak';
  let color = '#EF4444'; // Red
  let percent = 20;

  if (score >= 5) {
    label = 'Very Strong';
    color = '#10B981'; // Emerald
    percent = 100;
  } else if (score === 4) {
    label = 'Strong';
    color = '#00F2FE'; // Cyan
    percent = 80;
  } else if (score === 3) {
    label = 'Fair';
    color = '#F59E0B'; // Amber
    percent = 60;
  } else {
    label = 'Weak';
    color = '#EF4444'; // Red
    percent = Math.max(20, score * 20);
  }

  const isValid = checks.length && checks.hasUpper && checks.hasLower && checks.hasNumber && checks.hasSpecial;

  return {
    score,
    label,
    color,
    percent,
    isValid,
    checks: [
      { key: 'length', text: 'At least 12 characters', passed: checks.length },
      { key: 'hasUpper', text: 'Uppercase letter (A-Z)', passed: checks.hasUpper },
      { key: 'hasLower', text: 'Lowercase letter (a-z)', passed: checks.hasLower },
      { key: 'hasNumber', text: 'Number (0-9)', passed: checks.hasNumber },
      { key: 'hasSpecial', text: 'Special symbol (!@#$%^&*)', passed: checks.hasSpecial }
    ]
  };
}
