import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../app/api/feedback/upload/route';
import { NextRequest } from 'next/server';
import { prisma } from '../lib/prisma';
import { feedbackQueue } from '../lib/queue';

// Mock dependencies
vi.mock('../lib/prisma', () => ({
  prisma: {
    feedbackJob: {
      create: vi.fn(),
    },
  },
}));

vi.mock('../lib/queue', () => ({
  feedbackQueue: {
    add: vi.fn(),
  },
}));

describe('Feedback Ingestion API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process CSV upload and create jobs', async () => {
    // Mock file
    const csvContent = 'content,source\n"Great product",twitter\n"Bad UI",support';
    const file = new File([csvContent], 'feedback.csv', { type: 'text/csv' });
    Object.defineProperty(file, 'text', {
      value: async () => csvContent,
      writable: true,
    });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', 'proj_123');

    // Mock Request
    const req = {
      formData: vi.fn().mockResolvedValue(formData),
    } as unknown as NextRequest;

    // Mock DB response
    (prisma.feedbackJob.create as any).mockResolvedValue({ id: 'job_123' });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.jobId).toBe('job_123');

    // Verify DB call
    expect(prisma.feedbackJob.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        projectId: 'proj_123',
        totalItems: 2,
        status: 'PROCESSING',
      }),
    });

    // Verify Queue call
    expect(feedbackQueue.add).toHaveBeenCalledTimes(1); // 2 items fit in 1 batch
    expect(feedbackQueue.add).toHaveBeenCalledWith('ingest-batch', expect.objectContaining({
      jobId: 'job_123',
      items: expect.arrayContaining([
        expect.objectContaining({ content: 'Great product' }),
        expect.objectContaining({ content: 'Bad UI' }),
      ])
    }));
  });
});
