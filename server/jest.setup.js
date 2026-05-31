import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.test' });

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_here') {
  process.env.JWT_SECRET = 'test-jwt-secret-for-jest';
}

const baseUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (baseUri && !baseUri.includes('taskmanager_test')) {
  if (baseUri.includes('mongodb.net/')) {
    process.env.MONGODB_URI = baseUri.replace(
      /mongodb\.net\/([^?]*)/,
      'mongodb.net/taskmanager_test'
    );
  } else {
    process.env.MONGODB_URI = `${baseUri.replace(/\/?$/, '')}/taskmanager_test`;
  }
}
