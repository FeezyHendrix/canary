import { createEmailWorker } from './processors/email.processor';
import { env } from '../lib/env';

let emailWorker: ReturnType<typeof createEmailWorker> | null = null;

export function startWorker() {
  if (!env.WORKER_ENABLED) {
    console.log('[worker] Worker disabled via WORKER_ENABLED=false');
    return;
  }

  console.log(`[worker] Starting email worker with concurrency ${env.WORKER_CONCURRENCY}`);
  emailWorker = createEmailWorker();
}

export async function stopWorker() {
  if (emailWorker) {
    console.log('[worker] Stopping email worker');
    await emailWorker.close();
    emailWorker = null;
  }
}
