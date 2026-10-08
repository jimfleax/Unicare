import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import User from '../src/models/User';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const run = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/uniquecare';
    const dbName = process.env.DB_NAME || 'ucare_test';
    await mongoose.connect(mongoUri, { dbName });
    console.log(`Connected to ${dbName}`);

    const dataPath = '/home/jimfleax/Downloads/students.json';
    const studentsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    let credentials = '\n\n## Imported Students\n\n| Name | Password |\n|---|---|\n';
    let validCount = 0;
    let errorCount = 0;

    for (const student of studentsData) {
      // Validate using Mongoose
      const doc = new User(student);
      const err = doc.validateSync();
      
      if (err) {
        console.error(`Validation error for ${student.email}:`, err.message);
        errorCount++;
        continue;
      }
      
      // Generate a new password
      const plainPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      student.password = hashedPassword;
      
      try {
        await User.findOneAndUpdate(
          { email: student.email },
          { $set: student },
          { upsert: true, new: true, runValidators: true }
        );
        credentials += `| ${student.name} | ${plainPassword} |\n`;
        validCount++;
      } catch (dbErr: any) {
        console.error(`DB error for ${student.email}:`, dbErr.message);
        errorCount++;
      }
    }

    const credPath = path.resolve(__dirname, '../../credentials.md');
    fs.appendFileSync(credPath, credentials);
    
    console.log(`Successfully imported ${validCount} students.`);
    console.log(`Errors encountered: ${errorCount}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
};

run();
