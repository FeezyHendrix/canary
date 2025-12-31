import 'dotenv/config';
import { buildApp } from './app';
import { env } from './lib/env';

async function main() {
  const app = await buildApp();

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
