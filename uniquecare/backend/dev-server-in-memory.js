const { MongoMemoryServer } = require('mongodb-memory-server');
const { exec } = require('child_process');

async function start() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('Started in-memory MongoDB at', uri);
  
  process.env.MONGODB_URI = uri;
  process.env.NODE_ENV = 'development';
  
  const serverProcess = exec('npm run dev');
  serverProcess.stdout.pipe(process.stdout);
  serverProcess.stderr.pipe(process.stderr);
}

start();
