const { createClient } = require('redis');
require('dotenv').config();

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});


redis.connect().catch(console.error);


const QUEUE_KEY = 'waiting_users';


async function addToQueue(userId) {
  await redis.rPush(QUEUE_KEY, userId);
}


async function popFromQueue() {
  return await redis.lPop(QUEUE_KEY);
}

module.exports = { addToQueue, popFromQueue };

