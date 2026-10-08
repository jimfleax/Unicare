import app from './app';
import { connectDB } from './config/db';
import { seedFaqs } from './controllers/metadataController';

const PORT = process.env.PORT || 5000;

// Only start the server if not running in Vercel
if (!process.env.VERCEL) {
  connectDB().then(seedFaqs).catch((e) => console.error('FAQ seed skipped:', e.message));
  app.listen(PORT, () => {
    console.log(`🚀 Server listening at http://localhost:${PORT}`);
  });
}
