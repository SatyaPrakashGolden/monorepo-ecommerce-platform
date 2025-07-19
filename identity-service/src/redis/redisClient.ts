import { createClient } from 'redis';
const REDIS_HOST='localhost'
const REDIS_PORT=6379
const redisClient = createClient({
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
});

redisClient.on('error', (err: Error) => {
  console.error('❌ Redis Error:', err);
});

export default redisClient;
