import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../src/models/User';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const clear = async () => {
    const mongoUri = process.env.MONGODB_URI || '';
    const dbName = process.env.DB_NAME || 'ucare_test';
    await mongoose.connect(mongoUri, { dbName });
    await User.deleteMany({});
    console.log(`Cleared ${dbName}`);
    process.exit(0);
}
clear();
