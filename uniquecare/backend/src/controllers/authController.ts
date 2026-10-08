import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateToken } from '../services/authService';
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
  } catch (error) {
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
export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.json({
    success: true,
    data: {
      user: {
        _id: (req as any).user._id,
        name: (req as any).user.name,
        email: (req as any).user.email,
        role: (req as any).user.role
      }
    }
  });
});
