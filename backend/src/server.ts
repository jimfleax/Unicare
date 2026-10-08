import app from './app';
import { connectDB } from './config/db';
import { seedFaqs, seedMetadata } from './controllers/metadataController';

const PORT = process.env.PORT || 5000;

// Only start the server if not running in Vercel
if (!process.env.VERCEL) {
  connectDB().then(async () => {
    await seedFaqs();
    await seedMetadata();
  }).catch((e) => console.error('Seed skipped:', e.message));
  app.listen(PORT, () => {
    console.log(`🚀 Server listening at http://localhost:${PORT}`);
  });
}
