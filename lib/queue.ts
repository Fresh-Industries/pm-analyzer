import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const feedbackQueue = new Queue('feedback-ingestion', { connection });
export const analysisQueue = new Queue('feedback-analysis', { connection });
export const decisionQueue = new Queue('decision-generation', { connection });
export const codingQueue = new Queue('coding-agent', { connection });

