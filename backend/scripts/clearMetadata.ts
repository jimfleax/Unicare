import mongoose from 'mongoose';
import Metadata from '../src/models/Metadata';

async function clearMetadata() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ucare');
    console.log('Connected to MongoDB');
    
    const result = await Metadata.deleteMany({});
    console.log(`✅ Cleared ${result.deletedCount} metadata records`);
    
    await mongoose.connection.close();
    console.log('✅ Done');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearMetadata();
