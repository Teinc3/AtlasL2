import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import { clientPlugin, dataStorePlugin, requestLoggerPlugin } from './plugins';
import { apiRoutes, metadataRoutes } from './routes';


export async function buildApp() {
  const app = Fastify({
    logger: true,
    disableRequestLogging: true,
  }).withTypeProvider<TypeBoxTypeProvider>();

  await app.register(dataStorePlugin);
  await app.register(requestLoggerPlugin);
  await app.register(metadataRoutes);
  await app.register(apiRoutes);
  await app.register(clientPlugin);
  return app;
}
