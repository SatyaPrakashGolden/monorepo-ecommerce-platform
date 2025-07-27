// /home/satya/project/ecommerceBackend/api-gateway/src/radis/redis-client.ts
import { createClient } from 'redis';
import * as dotenv from 'dotenv';
dotenv.config();

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

redisClient.on('error', (err: Error) => {
  console.error('❌ Redis Error:', err);
});
(async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('✅ Redis connected successfully');
    }
  } catch (err) {
    console.error('❌ Failed to connect to Redis:', err);
  }
})();

export default redisClient;
