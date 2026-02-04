import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { feedbackQueue } from '@/lib/queue';
import { parse } from 'csv-parse/sync';

const BATCH_SIZE = 20;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;

    if (!file || !projectId) {
      return NextResponse.json({ error: 'Missing file or projectId' }, { status: 400 });
    }

    const fileContent = await file.text();
    let records: any[] = [];

    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
      records = JSON.parse(fileContent);
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Use CSV or JSON.' }, { status: 400 });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: 'Empty or invalid file content' }, { status: 400 });
    }

    // Map records to expected format
    const cleanRecords = records.map((r: any) => ({
      content: r.content || r.text || r.feedback || r.Description || r.description, // Try common fields
      source: r.source || 'upload',
      projectId,
    })).filter(r => r.content && typeof r.content === 'string' && r.content.trim().length > 0);

    if (cleanRecords.length === 0) {
        return NextResponse.json({ error: 'No valid feedback items found in file. Ensure columns are named "content", "text", or "feedback".' }, { status: 400 });
    }

    // Create Job
    const job = await prisma.feedbackJob.create({
      data: {
        projectId,
        filename: file.name,
        fileType: file.type || 'unknown',
        totalItems: cleanRecords.length,
        status: 'PROCESSING',
      },
    });

    // Chunk and Enqueue
    const chunks = [];
    for (let i = 0; i < cleanRecords.length; i += BATCH_SIZE) {
      const chunk = cleanRecords.slice(i, i + BATCH_SIZE);
      chunks.push(chunk);
    }

    const queuePromises = chunks.map(chunk => 
      feedbackQueue.add('ingest-batch', {
        jobId: job.id,
        items: chunk
      })
    );

    await Promise.all(queuePromises);

    return NextResponse.json({ 
      success: true, 
      jobId: job.id, 
      message: `Processing started for ${cleanRecords.length} items.` 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
