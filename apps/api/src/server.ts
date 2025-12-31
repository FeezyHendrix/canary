import 'dotenv/config';
import { buildApp } from './app';
import { env } from './lib/env';
import { startWorker, stopWorker } from './jobs/worker';
import { closeQueues } from './jobs/queues';

async function main() {
  const app = await buildApp();

  startWorker();

  const shutdown = async () => {
    console.log('Shutting down gracefully...');
    await stopWorker();
    await closeQueues();
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`Server running on port ${env.PORT}`);
    console.log(`API docs available at ${env.API_URL}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
