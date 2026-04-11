import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import { dataStorePlugin } from './plugins';
import { apiRoutes, metadataRoutes } from './routes';


export async function buildApp() {
  const app = Fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();
  await app.register(dataStorePlugin);
  await app.register(metadataRoutes);
  await app.register(apiRoutes);
  return app;
}
