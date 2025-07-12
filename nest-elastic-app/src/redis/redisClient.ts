import { createClient } from 'redis';
import * as dotenv from 'dotenv'; // Ensure dotenv is imported

dotenv.config(); // Load .env variables

const redisHost = process.env.REDIS_HOST || 'localhost'
const redisPort = process.env.REDIS_PORT || 6379


const redisClient = createClient({
  url: `redis://${redisHost}:${redisPort}`,
});

redisClient.on('error', (err: Error) => {
  console.error('❌ Redis Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis Connected Successfully!');
});

redisClient.connect().catch(console.error);

export default redisClient;
