import fastifyPlugin from 'fastify-plugin';
import { Static, Type } from '@sinclair/typebox';


const metadataNameSchema = Type.Object({
  name: Type.Union([
    Type.Literal('country_metadata.json'),
    Type.Literal('language_metadata.json'),
  ]),
});

type MetadataNameParams = Static<typeof metadataNameSchema>;


export default fastifyPlugin(async (app) => {
  app.get('/static/metadata/:name', {
    schema: {
      params: metadataNameSchema,
    },
  }, async (request) => {
    const { name } = request.params as MetadataNameParams;
    if (name === 'country_metadata.json') {
      return app.dataStore.countryMetadata;
    }
    return app.dataStore.languageMetadata;
  });
});
