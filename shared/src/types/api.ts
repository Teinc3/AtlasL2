import { Static, Type } from '@sinclair/typebox';


const ISO3CodeSchema = Type.String({ pattern: '^[A-Z]{3}$' });

export enum CommunicativeMode {
  Active = 'Active',
  Reception = 'Reception',
  Broadcast = 'Broadcast',
}

export const RegionalDistributionSchema = Type.Object({
  lang: ISO3CodeSchema,
  prevalence: Type.Number({ minimum: 0, maximum: 1 }),
});

// Explore is GET, so query concatenates all country codes with commas
export const ExploreQuerySchema = Type.Object({
  targets: Type.String({ minLength: 3 }),
});

export const ExploreResponseSchema = Type.Record(
  ISO3CodeSchema,
  Type.Array(RegionalDistributionSchema)
);

export const ReachRequestSchema = Type.Object({
  languages: Type.Array(ISO3CodeSchema, { minItems: 1 }),
  targets: Type.Array(ISO3CodeSchema), // Empty array implies Global
  mode: Type.Enum(CommunicativeMode),
});

export const ReachResponseSchema = Type.Object({
  globalIndex: Type.Number({ minimum: 0, maximum: 1 }),
  breakdown: Type.Record(ISO3CodeSchema, Type.Number({ minimum: 0, maximum: 1 })),
});

export const GapRequestSchema = Type.Object({
  currentLangs: Type.Array(ISO3CodeSchema, { minItems: 1 }),
  targets: Type.Array(ISO3CodeSchema),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
});

export const GapRecommendationSchema = Type.Object({
  lang: ISO3CodeSchema,
  potentialReach: Type.Number({ minimum: 0 }),
  marginalGain: Type.Number({ minimum: 0 }),
});

export const GapResponseSchema = Type.Array(GapRecommendationSchema);

export type ExploreQuery = Static<typeof ExploreQuerySchema>;
export type RegionalDistribution = Static<typeof RegionalDistributionSchema>;
export type ExploreResponse = Static<typeof ExploreResponseSchema>;
export type ReachRequest = Static<typeof ReachRequestSchema>;
export type ReachResponse = Static<typeof ReachResponseSchema>;
export type GapRequest = Static<typeof GapRequestSchema>;
export type GapRecommendation = Static<typeof GapRecommendationSchema>;
export type GapResponse = Static<typeof GapResponseSchema>;
