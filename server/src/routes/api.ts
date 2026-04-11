import fastifyPlugin from 'fastify-plugin';
import { Type } from '@sinclair/typebox';

import {
  ExploreQuerySchema, ExploreResponseSchema,
  GapRequestSchema, GapResponseSchema,
  ReachRequestSchema, ReachResponseSchema,
} from '@atlasl2/shared';
import { 
  buildExploreResponse, buildGapResponse, buildReachResponse, findUnknownTargets
} from '../logic';
import { parseTargetCodes } from '../utils';

import type { ExploreQuery, GapRequest, ReachRequest } from '@atlasl2/shared';


export default fastifyPlugin(async (app) => {
  app.get('/api/0/explore', {
    schema: {
      querystring: ExploreQuerySchema,
      response: {
        200: ExploreResponseSchema,
        404: Type.Object({
          message: Type.String(),
        }),
      },
    },
  }, async (request, reply) => {
    const { targets } = request.query as ExploreQuery;
    const requestedTargets = parseTargetCodes(targets);
    const unknownTargets = findUnknownTargets(app.dataStore, requestedTargets);

    if (unknownTargets.length > 0) {
      return reply.status(404).send({
        message: `Unknown targets: ${unknownTargets.join(', ')}`,
      });
    }

    return buildExploreResponse(app.dataStore, requestedTargets);
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
