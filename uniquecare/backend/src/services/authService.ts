import jwt from 'jsonwebtoken';

export const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'ucare_super_secret_jwt_key_2026';
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

export const verifyToken = (token: string): any => {
  const secret = process.env.JWT_SECRET || 'ucare_super_secret_jwt_key_2026';
  return jwt.verify(token, secret);
};
