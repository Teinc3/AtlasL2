import type { AppData } from './appdata';


declare module 'fastify' {
  interface FastifyInstance {
    dataStore: Readonly<AppData>;
  }
}
