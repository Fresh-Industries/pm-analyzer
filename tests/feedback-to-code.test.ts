import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../app/api/feedback/route';
import { NextRequest } from 'next/server';
import { prisma } from '../lib/prisma';
import { analysisQueue, codingQueue } from '../lib/queue';
// We need to delay importing workers until mocks are set up, or use vi.mock appropriately
// But since they are top-level side-effects, we mock the dependencies they use.

// Mock BullMQ to prevent connection
vi.mock('bullmq', () => {
  return {
    Worker: class {
      constructor(name, processor) {
        this.name = name;
        this.processor = processor;
        (global as any)[`worker_${name}`] = this;
      }
    },
    Queue: class {
      constructor(name) { this.name = name; }
      add = vi.fn();
    }
  };
});

// Mock Redis
vi.mock('ioredis', () => {
  return {
    default: class {
        constructor() {}
    }
  }
});

// Mock Dependencies
vi.mock('../lib/prisma', () => ({
  prisma: {
    feedback: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $executeRaw: vi.fn(),
    feedbackJob: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../lib/embeddings', () => ({
  generateEmbeddings: vi.fn().mockResolvedValue([[0.1, 0.2]]),
}));

vi.mock('../lib/spec-generator', () => ({
  generateSpec: vi.fn().mockResolvedValue({
    type: 'BUG',
    title: 'Fix Bug',
    summary: 'A bug fix',
    details: {}
  }),
}));

vi.mock('../lib/coding-agent', () => ({
  runOpenHandsAgent: vi.fn().mockResolvedValue({
    githubPrUrl: 'https://github.com/test/pr/1',
    logs: 'logs'
  }),
}));

describe('Feedback to Code Pipeline', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Feedback Submission API should create feedback and trigger analysis', async () => {
    const req = {
      json: async () => ({
        projectId: 'proj_1',
        content: 'Fix the button',
        source: 'user',
        type: 'bug'
      })
    } as NextRequest;

    (prisma.feedback.create as any).mockResolvedValue({
      id: 'fb_1',
      text: 'Fix the button',
      status: 'pending_analysis'
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.id).toBe('fb_1');
    expect(prisma.feedback.create).toHaveBeenCalled();
    // Check queue was called
    // We need to import the mocked queue instance. 
    // Since we mocked the class, we need to inspect the export from '../lib/queue'
    const { analysisQueue } = await import('../lib/queue');
    expect(analysisQueue.add).toHaveBeenCalledWith('analyze', { feedbackId: 'fb_1' });
  });

  it('2. Analysis Worker should classify and generate spec', async () => {
    // Import worker (this will trigger the constructor mock)
    await import('../lib/worker');
    const worker = (global as any)['worker_feedback-analysis'];
    
    // Mock DB finding feedback
    (prisma.feedback.findUnique as any).mockResolvedValue({
      id: 'fb_1',
      text: 'Fix the button',
      status: 'pending_analysis'
    });

    // Run processor
    await worker.processor({ data: { feedbackId: 'fb_1' } });

    // Verify update
    expect(prisma.feedback.update).toHaveBeenCalledWith({
      where: { id: 'fb_1' },
      data: expect.objectContaining({
        status: 'analyzed', // or ready_to_build
        type: 'bug',
        spec: expect.anything()
      })
    });
  });

  it('3. Coding Worker should run agent and create PR', async () => {
    // Import worker
    await import('../lib/openhands-worker');
    const worker = (global as any)['worker_coding-agent'];

    // Mock DB
    (prisma.feedback.findUnique as any).mockResolvedValue({
      id: 'fb_1',
      text: 'Fix the button',
      status: 'building',
      projectId: 'proj_1',
      project: { githubRepo: 'org/repo' },
      spec: { title: 'Spec' }
    });

    // Run processor
    await worker.processor({ data: { feedbackId: 'fb_1' } });

    // Verify agent run
    const { runOpenHandsAgent } = await import('../lib/coding-agent');
    expect(runOpenHandsAgent).toHaveBeenCalledWith(
        { title: 'Spec' }, 
        'org/repo'
    );

    // Verify update to shipped
    expect(prisma.feedback.update).toHaveBeenCalledWith({
      where: { id: 'fb_1' },
      data: expect.objectContaining({
        status: 'ready_for_review',
        githubPrUrl: 'https://github.com/test/pr/1'
      })
    });
  });

});
