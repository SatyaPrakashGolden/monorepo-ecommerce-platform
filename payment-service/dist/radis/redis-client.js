"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const dotenv = require("dotenv");
dotenv.config();
const redisClient = (0, redis_1.createClient)({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});
redisClient.on('error', (err) => {
    console.error('❌ Redis Error:', err);
});
(async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log('✅ Redis connected successfully');
        }
    }
    catch (err) {
        console.error('❌ Failed to connect to Redis:', err);
    }
})();
exports.default = redisClient;
//# sourceMappingURL=redis-client.js.map