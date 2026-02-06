// Agent Orchestrator - A2A Protocol Implementation

import { v4 as uuid } from 'crypto';
import type { AgentMessage, AgentType, TaskContext } from './types';
import { prisma } from '@/lib/prisma';

export class Orchestrator {
  private messageLog: AgentMessage[] = [];
  private checkpoints: string[] = [];
  
  // Generate unique message ID
  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Send message from one agent to another
  async send(
    from: AgentType,
    to: AgentType,
    action: AgentMessage['action'],
    payload: Record<string, any>,
    requiresApproval: boolean = false
  ): Promise<AgentMessage> {
    const message: AgentMessage = {
      id: this.generateId(),
      from,
      to,
      action,
      payload,
      timestamp: new Date().toISOString(),
      requiresApproval,
    };
    
    this.messageLog.push(message);
    
    // Log to database
    await this.logMessage(message);
    
    return message;
  }
  
  // Create a task for an agent
  async createTask(
    agentType: AgentType,
    input: Record<string, any>,
    checkpoint: string | null = null
  ) {
    const task = await prisma.agentTask.create({
      data: {
        agent: agentType,
        status: 'pending',
        input: input as any,
        checkpoint,
      },
    });
    
    return task;
  }
  
  // Complete a task
  async completeTask(taskId: string, output: Record<string, any>) {
    await prisma.agentTask.update({
      where: { id: taskId },
      data: {
        status: 'completed',
        output: output as any,
      },
    });
  }
  
  // Request human checkpoint
  async requestCheckpoint(
    taskId: string,
    checkpointId: string,
    question: string
  ) {
    await prisma.agentTask.update({
      where: { id: taskId },
      data: {
        status: 'waiting',
        checkpoint: checkpointId,
      },
    });
    
    // Store checkpoint question
    await prisma.checkpoint.create({
      data: {
        taskId,
        question,
        checkpointId,
      },
    });
    
    return { waiting: true, checkpointId };
  }
  
  // Approve checkpoint (human input)
  async approveCheckpoint(
    checkpointId: string,
    approved: boolean,
    feedback?: string
  ) {
    const checkpoint = await prisma.checkpoint.findUnique({
      where: { checkpointId },
    });
    
    if (!checkpoint) {
      return { error: 'Checkpoint not found' };
    }
    
    await prisma.checkpoint.update({
      where: { checkpointId },
      data: {
        approved,
        feedback,
      },
    });
    
    await prisma.agentTask.update({
      where: { id: checkpoint.taskId },
      data: {
        status: 'pending',
        humanApproved: approved,
        humanFeedback: feedback,
      },
    });
    
    return { approved };
  }
  
  // Get task status
  async getTaskStatus(taskId: string) {
    const task = await prisma.agentTask.findUnique({
      where: { id: taskId },
      include: {
        checkpoints: true,
      },
    });
    
    return task;
  }
  
  // Get all messages for a task
  async getMessages(taskId: string): Promise<AgentMessage[]> {
    const messages = await prisma.agentMessage.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });
    
    return messages.map(m => ({
      id: m.id,
      from: m.from as AgentType,
      to: m.to as AgentType,
      action: m.action as AgentMessage['action'],
      payload: m.payload as Record<string, any>,
      timestamp: m.createdAt.toISOString(),
    }));
  }
  
  // Log message to database
  private async logMessage(message: AgentMessage) {
    try {
      await prisma.agentMessage.create({
        data: {
          id: message.id,
          from: message.from,
          to: message.to,
          action: message.action,
          payload: message.payload as any,
          requiresApproval: message.requiresApproval || false,
        },
      });
    } catch (error) {
      // Silent fail - logging shouldn't break the flow
      console.error('Failed to log message:', error);
    }
  }
  
  // Clear message log
  clearLog() {
    this.messageLog = [];
    this.checkpoints = [];
  }
  
  // Get message history
  getHistory(): AgentMessage[] {
    return [...this.messageLog];
  }
}

// Export singleton instance
export const orchestrator = new Orchestrator();
