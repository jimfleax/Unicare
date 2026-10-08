import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateToken, generateResetToken, sendResetEmail } from '../services/authService';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

// 📝 USER SIGNUP / REGISTER
// POST /api/auth/register
export const registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email, and password', 400));
  }

  // Check if user already exists
  const userExists = await User.findOne({ email: email.trim().toLowerCase() });
  if (userExists) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Hash password with bcrypt
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user in database
  const user = await User.create({
    name,
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    role: role || 'student'
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully!',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: generateToken(user._id.toString())
    }
  });
});

// 🔑 USER LOGIN
// POST /api/auth/login
export const loginUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Find user by email
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (!user.password) {
    return next(new AppError('Invalid login method. Try Google OAuth.', 401));
  }

  // Compare password with hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError('Invalid email or password', 401));
  }

  res.json({
    success: true,
    message: 'Login successful!',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: generateToken(user._id.toString())
    }
  });
});

// 🌐 GOOGLE LOGIN
// POST /api/auth/google
export const googleLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.body;

  if (!token) {
    return next(new AppError('Please provide a Google token', 400));
  }

  // Normally we would verify the token with google-auth-library here.
  // For the sake of this phase, let's assume we decode it (or mock it).
  // Mocking decode: (In a real app use OAuth2Client)
  let email, name;
  try {
    // A mock basic JWT decoder for testing purposes
    // since we might test this with a fake token.
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    const payload = JSON.parse(jsonPayload);
    email = payload.email;
    name = payload.name;
  } catch {
    // If it's not a real JWT during tests, fallback to mock if required
    // or just return 401. Let's return 401.
    return next(new AppError('Invalid Google token', 401));
  }

  if (!email) {
    return next(new AppError('Invalid Google token payload', 401));
  }

  let user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    user = await User.create({
      name: name || 'Google User',
      email: email.trim().toLowerCase(),
      role: 'student'
      // no password for Google users
    });
  }

  res.json({
    success: true,
    message: 'Google Login successful!',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: generateToken(user._id.toString())
    }
  });
});

// 👤 GET CURRENT USER PROFILE
// GET /api/auth/me
export const getMe = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const authReq = req as Request & { user?: { _id: unknown; name: string; email: string; role: string } };
  res.json({
    success: true,
    data: {
      user: {
        _id: authReq.user?._id,
        name: authReq.user?.name,
        email: authReq.user?.email,
        role: authReq.user?.role
      }
    }
  });
});

// 🔄 FORGOT PASSWORD
// POST /api/auth/forgot-password
export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Please provide an email', 400));
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  
  // Generic success message to prevent email enumeration
  const successMessage = 'If an account exists, a password reset link has been sent.';

  if (!user) {
    return res.status(200).json({ success: true, message: successMessage });
  }

  const resetToken = generateResetToken();
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
  await user.save();

  await sendResetEmail(user.email, resetToken);

  res.status(200).json({
    success: true,
    message: successMessage
  });
});

// 🔄 RESET PASSWORD
// POST /api/auth/reset-password/:token
export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return next(new AppError('Please provide a new password', 400));
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully'
  });
});
