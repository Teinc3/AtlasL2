import fastifyPlugin from 'fastify-plugin';
import { Type } from '@sinclair/typebox';

import {
  ExploreRequestSchema, ExploreResponseSchema,
  GapRequestSchema, GapResponseSchema,
  ReachRequestSchema, ReachResponseSchema,
} from '@atlasl2/shared';
import { 
  buildExploreResponse, buildGapResponse, buildReachResponse
} from '../logic';

import type { ExploreRequest, GapRequest, ReachRequest } from '@atlasl2/shared';


export default fastifyPlugin(async (app) => {
  app.post('/api/0/explore', {
    schema: {
      body: ExploreRequestSchema,
      response: {
        200: ExploreResponseSchema,
      },
    },
  }, async (request) => {
    const { countries, languages } = request.body as ExploreRequest;
    return buildExploreResponse(app.dataStore, { countries, languages });
  });

  app.post('/api/0/reach', {
    schema: {
      body: ReachRequestSchema,
      response: {
        200: ReachResponseSchema,
      },
    },
  }, async (request) => {
    return buildReachResponse(app.dataStore, request.body as ReachRequest);
  });

  app.post('/api/0/gap', {
    schema: {
      body: GapRequestSchema,
      response: {
        200: GapResponseSchema,
      },
    },
  }, async (request) => {
    return buildGapResponse(app.dataStore, request.body as GapRequest);
  });
});
