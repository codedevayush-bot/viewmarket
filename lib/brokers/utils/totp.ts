import { generateSync, verifySync } from 'otplib';

/**
 * Standardized TOTP generation utility for ViewMarket Broker Adapters.
 * Ensures consistent handling of secrets and generation intervals.
 */
export const generateTOTP = (secret: string): string => {
  if (!secret) {
    throw new Error('TOTP secret is required');
  }

  // Clean the secret (remove spaces) which is common in manual entries
  const cleanSecret = secret.replace(/\s/g, '');

  return generateSync({ secret: cleanSecret });
};

/**
 * Validates a TOTP code against a secret.
 */
export const verifyTOTP = (token: string, secret: string): boolean => {
  const cleanSecret = secret.replace(/\s/g, '');
  return verifySync({ token, secret: cleanSecret }).valid;
};
