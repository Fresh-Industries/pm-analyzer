import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from './prisma';
import { runOpenHandsAgent } from './coding-agent';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const codingWorker = new Worker(
  'coding-agent',
  async (job: Job) => {
    const { feedbackId } = job.data;
    console.log(`Starting coding agent for feedback ${feedbackId}`);

    try {
      const feedback = await prisma.feedback.findUnique({
        where: { id: feedbackId },
        include: { project: true },
      });

      if (!feedback) throw new Error(`Feedback ${feedbackId} not found`);
      if (!feedback.project.repoUrl) {
        throw new Error(`Project ${feedback.projectId} has no repoUrl`);
      }
      if (!feedback.spec) {
        throw new Error(`Feedback ${feedbackId} has no spec`);
      }

      // Update status to building
      await prisma.feedback.update({
        where: { id: feedbackId },
        data: { status: 'building' },
      });

      // Run Agent
      const result = await runOpenHandsAgent(feedback.spec as any, feedback.project.repoUrl);

      // Update status to shipped (or ready_for_review)
      await prisma.feedback.update({
        where: { id: feedbackId },
        data: {
          status: 'shipped',
          prUrl: result.prUrl,
        },
      });

      console.log(`Coding agent completed for ${feedbackId}. PR: ${result.prUrl}`);
    } catch (error) {
      console.error(`Coding agent failed for ${feedbackId}:`, error);
      
      await prisma.feedback.update({
        where: { id: feedbackId },
        data: { status: 'failed' }, // You might want to store error message too
      });
      
      throw error;
    }
  },
  {
    connection,
    concurrency: 1, // Keep concurrency low for heavy agent tasks
  }
);
