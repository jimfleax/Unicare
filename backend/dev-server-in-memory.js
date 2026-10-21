const { MongoMemoryServer } = require('mongodb-memory-server');
const { exec, execSync } = require('child_process');

async function start() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('Started in-memory MongoDB at', uri);

  process.env.MONGODB_URI = uri;
  process.env.DB_NAME = 'ucare';
  process.env.NODE_ENV = 'development';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'unicare_dev_secret';

  // Auto-seed users so you don't have to run it separately
  console.log('Seeding users...');
  try {
    execSync('npx ts-node scripts/seedUsers.ts', {
      env: { ...process.env },
      stdio: 'inherit',
    });
    console.log('✅ Users seeded');
  } catch (e) {
    console.warn('⚠️  Seed failed (users may already exist):', e.message);
  }

  const serverProcess = exec('npm run dev', { env: { ...process.env } });
  serverProcess.stdout.pipe(process.stdout);
  serverProcess.stderr.pipe(process.stderr);
}

start();
