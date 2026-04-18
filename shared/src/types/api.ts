import { Static, Type } from '@sinclair/typebox';


const ISO3CodeSchema = Type.String({ pattern: '^[A-Z]{3}$' });

export enum CommunicativeMode {
  None,
  Active,
  Reception,
  Broadcast
}

export const RegionalDistributionSchema = Type.Object({
  lang: ISO3CodeSchema,
  prevalence: Type.Number({ minimum: 0, maximum: 1 }),
  population: Type.Number({ minimum: 0 }),
});

export const ReachCountryMetricsSchema = Type.Object({
  score: Type.Number({ minimum: 0, maximum: 1 }),
  reachable: Type.Number({ minimum: 0 }),
  unreachable: Type.Number({ minimum: 0 }),
});

export const TopContributingRegionSchema = Type.Object({
  countryID: ISO3CodeSchema,
  score: Type.Number({ minimum: 0, maximum: 1 }),
  estimatedSpeakers: Type.Number({ minimum: 0 }),
});

export const ExploreRequestSchema = Type.Object({
  countries: Type.Array(ISO3CodeSchema),
  languages: Type.Optional(Type.Array(ISO3CodeSchema)),
});

export const ExploreResponseSchema = Type.Object({
  selectedPopulation: Type.Number({ minimum: 0 }),
  topLanguages: Type.Array(RegionalDistributionSchema, { maxItems: 5 }),
});

export const ReachRequestSchema = Type.Object({
  languages: Type.Array(ISO3CodeSchema, { minItems: 1 }),
  targets: Type.Array(ISO3CodeSchema), // Empty array implies Global
  mode: Type.Enum(CommunicativeMode),
});

export const ReachResponseSchema = Type.Object({
  globalIndex: Type.Number({ minimum: 0, maximum: 1 }),
  breakdown: Type.Record(ISO3CodeSchema, ReachCountryMetricsSchema),
  topContributingRegions: Type.Array(TopContributingRegionSchema, { maxItems: 5 }),
});

export const GapRequestSchema = Type.Object({
  currentLangs: Type.Array(ISO3CodeSchema, { minItems: 1 }),
  targets: Type.Array(ISO3CodeSchema),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 10 })),
});

export const GapRecommendationSchema = Type.Object({
  lang: ISO3CodeSchema,
  potentialReach: Type.Number({ minimum: 0 }),
  marginalGain: Type.Number({ minimum: 0 }),
  estimatedPopulationGain: Type.Number({ minimum: 0 }),
});

export const GapResponseSchema = Type.Array(GapRecommendationSchema);

export type ExploreRequest = Static<typeof ExploreRequestSchema>;
export type RegionalDistribution = Static<typeof RegionalDistributionSchema>;
export type ReachCountryMetrics = Static<typeof ReachCountryMetricsSchema>;
export type TopContributingRegion = Static<typeof TopContributingRegionSchema>;
export type ExploreResponse = Static<typeof ExploreResponseSchema>;
export type ReachRequest = Static<typeof ReachRequestSchema>;
export type ReachResponse = Static<typeof ReachResponseSchema>;
export type GapRequest = Static<typeof GapRequestSchema>;
export type GapRecommendation = Static<typeof GapRecommendationSchema>;
export type GapResponse = Static<typeof GapResponseSchema>;
