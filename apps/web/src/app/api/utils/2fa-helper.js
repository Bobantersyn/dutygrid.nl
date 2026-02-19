import speakeasy from 'speakeasy';
import crypto from 'crypto';

/**
 * 2FA Helper Functions
 * 
 * Gebruikt TOTP (Time-based One-Time Password) voor 2FA
 */

/**
 * Generate een 2FA secret voor een nieuwe user
 * 
 * @param {string} email - User email
 * @param {string} appName - App naam (default: DutyGrid)
 * @returns {Object} { secret, otpauthUrl }
 */
export function generate2FASecret(email, appName = 'DutyGrid') {
    // Generate secret
    const secret = speakeasy.generateSecret({
        name: `${appName} (${email})`,
        length: 32
    });

    return {
        secret: secret.base32,
        otpauthUrl: secret.otpauth_url
    };
}

/**
 * Verify een 2FA code
 * 
 * @param {string} token - 6-digit code van authenticator app
 * @param {string} secret - User's 2FA secret
 * @returns {boolean} True als code valid is
 */
export function verify2FAToken(token, secret) {
    try {
        return speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: 1 // 30 seconden voor/na
        });
    } catch (error) {
        console.error('[2FA] Verification error:', error);
        return false;
    }
}

/**
 * Generate backup codes voor 2FA recovery
 * 
 * @param {number} count - Aantal backup codes (default: 10)
 * @returns {string[]} Array van backup codes
 */
export function generateBackupCodes(count = 10) {
    const codes = [];

    for (let i = 0; i < count; i++) {
        // Generate random 8-character code
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        // Format als XXXX-XXXX
        const formatted = `${code.slice(0, 4)}-${code.slice(4, 8)}`;
        codes.push(formatted);
    }

    return codes;
}

/**
 * Hash een backup code voor opslag in database
 * 
 * @param {string} code - Backup code
 * @returns {string} Hashed code
 */
export function hashBackupCode(code) {
    return crypto
        .createHash('sha256')
        .update(code)
        .digest('hex');
}

/**
 * Verify een backup code
 * 
 * @param {string} code - Ingevoerde backup code
 * @param {string[]} hashedCodes - Array van gehashte backup codes
 * @returns {number} Index van de gebruikte code, of -1 als invalid
 */
export function verifyBackupCode(code, hashedCodes) {
    const hashedInput = hashBackupCode(code);
    return hashedCodes.findIndex(hash => hash === hashedInput);
}

/**
 * Check of 2FA required is voor een user
 * 
 * @param {Object} user - User object met two_factor_enabled veld
 * @returns {boolean}
 */
export function is2FARequired(user) {
    return user?.two_factor_enabled === true;
}

/**
 * Generate QR code data URL
 * 
 * @param {string} otpauthUrl - OTPAuth URL
 * @returns {Promise<string>} Data URL voor QR code image
 */
export async function generateQRCode(otpauthUrl) {
    const QRCode = (await import('qrcode')).default;

    try {
        const dataUrl = await QRCode.toDataURL(otpauthUrl);
        return dataUrl;
    } catch (error) {
        console.error('[2FA] QR code generation error:', error);
        throw new Error('Failed to generate QR code');
    }
}

export default {
    generate2FASecret,
    verify2FAToken,
    generateBackupCodes,
    hashBackupCode,
    verifyBackupCode,
    is2FARequired,
    generateQRCode
};
