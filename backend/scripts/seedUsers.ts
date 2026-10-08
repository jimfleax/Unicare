import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../src/models/User';
import bcrypt from 'bcryptjs';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedUsers = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/unicare';
    const dbName = process.env.DB_NAME || 'ucare_test';
    await mongoose.connect(mongoUri, { dbName });
    console.log('MongoDB Connected...');

    const users = [
      {
        name: 'Admin User',
        email: 'admin@ucare.com',
        password: 'password123',
        role: 'admin',
        phone: '1234567890'
      },
      {
        name: 'Technician User',
        email: 'tech@ucare.com',
        password: 'password123',
        role: 'technician',
        phone: '1234567892'
      },
      {
        name: 'Student User',
        email: 'student@ucare.com',
        password: 'password123',
        role: 'student',
        phone: '1234567893'
      }
    ];

    // Check if users already exist to avoid duplicates
    for (const u of users) {
      const existingUser = await User.findOne({ email: u.email });
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        u.password = await bcrypt.hash(u.password, salt);
        await User.create(u);
        console.log(`Created user: ${u.email} (${u.role})`);
      } else {
        console.log(`User already exists: ${u.email}`);
      }
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedUsers();
