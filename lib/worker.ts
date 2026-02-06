import "dotenv/config";
import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from './prisma';
import { generateEmbeddings } from './embeddings';
import { generateSpec } from './spec-generator';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const feedbackWorker = new Worker(
  'feedback-ingestion',
  async (job: Job) => {
    const { jobId, items } = job.data;
    // items: { content: string, source?: string, projectId: string }[]

    try {
      console.log(`Processing batch for Job ${jobId} (${items.length} items)`);
      
      // 1. Generate Embeddings
      const contents = items.map((i: any) => i.content);
      const embeddings = await generateEmbeddings(contents);

      // 2. Save to DB
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const embedding = embeddings[i];

        // Create feedback record
        const feedback = await prisma.feedback.create({
          data: {
            text: item.content,
            source: item.source,
            projectId: item.projectId,
            status: 'pending_analysis',
            // Default model is set in POST /api/feedback/
            analysisModel: item.analysisModel, 
          },
        });

        // Update with vector
        const vectorString = `[${embedding.join(',')}]`;
        
        await prisma.$executeRaw`
          UPDATE "feedback" 
          SET "embedding" = ${vectorString}::vector 
          WHERE "id" = ${feedback.id}
        `;
        
        // Trigger individual analysis
        await prisma.feedbackJob.update({
          where: { id: jobId },
          data: {
            processedItems: { increment: 1 },
          },
        });
      }

      // 4. Check for Completion
      const jobRecord = await prisma.feedbackJob.findUnique({
        where: { id: jobId },
      });

      if (jobRecord && jobRecord.processedItems >= jobRecord.totalItems) {
        await prisma.feedbackJob.update({
          where: { id: jobId },
          data: { status: 'COMPLETED' },
        });
        console.log(`Job ${jobId} COMPLETED`);
      }
    } catch (error) {
      console.error(`Batch processing failed for Job ${jobId}:`, error);
      
      // Update fail count
      await prisma.feedbackJob.update({
        where: { id: jobId },
        data: {
            failedItems: { increment: items.length },
        }
      });
      
      throw error;
    }
  },
  { 
    connection, 
    concurrency: 5,
    lockDuration: 300000 
  }
);

export const analysisWorker = new Worker(
  'feedback-analysis',
  async (job: Job) => {
    const { feedbackId } = job.data;
    console.log(`Analyzing feedback ${feedbackId}`);

    try {
      const feedback = await prisma.feedback.findUnique({
        where: { id: feedbackId },
      });

      if (!feedback) throw new Error(`Feedback ${feedbackId} not found`);

      // Generate Spec
      const spec = await generateSpec(feedback.text, feedback.analysisModel);

      // Update Feedback
      await prisma.feedback.update({
        where: { id: feedbackId },
        data: {
          spec: spec as any,
          type: spec.type === 'BUG' ? 'bug' : 'feature',
          status: 'analyzed',
        },
      });

      console.log(`Analysis complete for ${feedbackId}.`);
      
    } catch (error) {
      console.error(`Analysis failed for ${feedbackId}:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 2,
  }
);
