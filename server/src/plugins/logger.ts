import { createWriteStream } from 'node:fs';
import { access, mkdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyPlugin from 'fastify-plugin';


const currentFileDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentFileDir, '..', '..', '..');

const logsDir = path.join(repoRoot, 'logs');
const requestsLogPath = path.join(logsDir, 'requests.log');
const requestsOldLogPath = path.join(logsDir, 'requests_old.log');


async function rotateRequestsLog() {
  try {
    await access(requestsLogPath);
  } catch {
    return;
  }

  await rm(requestsOldLogPath, { force: true });
  await rename(requestsLogPath, requestsOldLogPath);
}

export default fastifyPlugin(async (instance) => {
  await mkdir(logsDir, { recursive: true });
  await rotateRequestsLog();
  const requestsLogStream = createWriteStream(requestsLogPath, { flags: 'a' });

  instance.addHook('onResponse', async (request, reply) => {
    requestsLogStream.write(`${JSON.stringify({
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    })}\n`);
  });

  instance.addHook('onClose', async () => {
    requestsLogStream.end();
  });
});