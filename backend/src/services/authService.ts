import jwt from 'jsonwebtoken';

export const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'ucare_super_secret_jwt_key_2026';
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

export const verifyToken = (token: string): jwt.JwtPayload | string => {
  const secret = process.env.JWT_SECRET || 'ucare_super_secret_jwt_key_2026';
  return jwt.verify(token, secret);
};

import crypto from 'crypto';

export const generateResetToken = (): string => {
  return crypto.randomBytes(20).toString('hex');
};

export const sendResetEmail = async (email: string, token: string): Promise<void> => {
  // Mock email function as per plan
  console.log(`\n=== MOCK EMAIL SERVICE ===`);
  console.log(`To: ${email}`);
  console.log(`Subject: Password Reset Request`);
  console.log(`Reset Link: http://localhost:5173/reset-password/${token}`);
  console.log(`==========================\n`);
};
