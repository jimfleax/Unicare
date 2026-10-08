import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Idempotent student seeder. Upserts by email, never deletes anything.
 * Existing users keep their password; only missing profile fields are filled in.
 * Override the default password with SEED_STUDENT_PASSWORD.
 */

const DEFAULT_PASSWORD = process.env.SEED_STUDENT_PASSWORD || 'password123';

const BRANCHES = [
  { code: 'BTCS', name: 'B.Tech Computer Science & Engineering' },
  { code: 'BTIT', name: 'B.Tech Information Technology' },
  { code: 'BTEC', name: 'B.Tech Electronics & Communication Engineering' },
  { code: 'BTME', name: 'B.Tech Mechanical Engineering' },
  { code: 'BTCE', name: 'B.Tech Civil Engineering' },
];

const BATCHES = [
  { name: 'The Uniques 2.0', year: 2023 },
  { name: 'The Uniques 3.0', year: 2024 },
  { name: 'The Uniques 4.0', year: 2025 },
];

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

const NAMES = [
  'Aarav Sharma', 'Vivaan Gupta', 'Aditya Verma', 'Vihaan Singh', 'Arjun Mehta',
  'Sai Reddy', 'Reyansh Kumar', 'Ayaan Khan', 'Krishna Yadav', 'Ishaan Joshi',
  'Ananya Iyer', 'Diya Patel', 'Aadhya Nair', 'Saanvi Rao', 'Kiara Malhotra',
  'Myra Kapoor', 'Anika Bose', 'Navya Menon', 'Pari Saxena', 'Riya Chauhan',
  'Rohan Desai', 'Karan Thakur', 'Neha Pandey', 'Pooja Mishra', 'Rahul Tiwari',
  'Sneha Agarwal', 'Vikram Rathore', 'Tanvi Bhatt', 'Manish Dubey', 'Simran Kaur',
];

const slug = (n: string) => n.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '');

const buildStudents = () =>
  NAMES.map((name, i) => {
    const branch = BRANCHES[i % BRANCHES.length];
    const batch = BATCHES[i % BATCHES.length];
    const seq = String(i + 1).padStart(3, '0');
    return {
      name,
      email: `${slug(name)}@student.ucare.com`,
      role: 'student' as const,
      phone: `98${String(10000000 + i * 7919).slice(0, 8)}`,
      avatarColor: COLORS[i % COLORS.length],
      carePoints: (i * 37) % 250,
      batch: batch.name,
      batchCode: `${batch.year}${branch.code}`,
      branch: branch.name,
      rollNo: `${batch.year}${branch.code}${seq}`,
    };
  });

const run = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/unicare';
  const dbName = process.env.DB_NAME || 'ucare_test';
  await mongoose.connect(mongoUri, { dbName });
  console.log(`Connected to ${dbName}`);

  const hash = await bcrypt.hash(DEFAULT_PASSWORD, await bcrypt.genSalt(10));
  let created = 0;
  let updated = 0;

  for (const s of buildStudents()) {
    const existing = await User.findOne({ email: s.email });
    if (!existing) {
      await User.create({ ...s, password: hash });
      created++;
    } else {
      let dirty = false;
      for (const k of ['batch', 'batchCode', 'branch', 'rollNo'] as const) {
        if (!existing[k]) { existing[k] = s[k]; dirty = true; }
      }
      if (dirty) { await existing.save(); updated++; }
    }
  }

  // Backfill the pre-existing demo student so its profile is not blank.
  const demo = await User.findOne({ email: 'student@ucare.com' });
  if (demo && !demo.rollNo) {
    Object.assign(demo, {
      batch: 'The Uniques 3.0',
      batchCode: '2024BTCS',
      branch: 'B.Tech Computer Science & Engineering',
      rollNo: '2024BTCS000',
    });
    await demo.save();
    updated++;
  }

  const total = await User.countDocuments({ role: 'student' });
  console.log(`Students created: ${created}, updated: ${updated}, total in DB: ${total}`);
  console.log(`Login password for new students: ${DEFAULT_PASSWORD}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Error seeding students:', err);
  process.exit(1);
});
