import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from '../lib/env';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

export const emailQueue = new Queue('email', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 60000,
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
});

export interface PdfAttachmentJob {
  templateId: string;
  filename: string;
  variables?: Record<string, unknown>;
}

export interface EmailJobData {
  emailLogId: string;
  teamId: string;
  templateId: string;
  to: string[];
  from: string;
  subject: string;
  variables: Record<string, unknown>;
  pdfAttachments?: PdfAttachmentJob[];
  replyTo?: string;
  tags?: string[];
  metadata?: Record<string, string>;
}

export async function closeQueues() {
  await emailQueue.close();
  connection.disconnect();
}
