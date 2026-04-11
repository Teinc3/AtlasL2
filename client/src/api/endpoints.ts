import {
	CountryMetadataMapSchema, LanguageMetadataMapSchema,
	ExploreResponseSchema,
	GapRequestSchema, GapResponseSchema,
	ReachRequestSchema, ReachResponseSchema,
} from '@atlasl2/shared';
import { assertSchema, fetchJSON } from './fetch';

import type {
	CountryMetadataMap, LanguageMetadataMap,
	ExploreResponse,
	GapRequest, GapResponse,
	ReachRequest, ReachResponse,
} from '@atlasl2/shared';


export async function fetchCountryMetadata(): Promise<CountryMetadataMap> {
	return fetchJSON<CountryMetadataMap>(
		'/static/metadata/country_metadata.json',
		CountryMetadataMapSchema,
		undefined,
		'country metadata'
	);
}

export async function fetchLanguageMetadata(): Promise<LanguageMetadataMap> {
	return fetchJSON<LanguageMetadataMap>(
		'/static/metadata/language_metadata.json',
		LanguageMetadataMapSchema,
		undefined,
		'language metadata'
	);
}

export async function fetchExplore(targets: string[]): Promise<ExploreResponse> {
	const targetParam = targets.join(',');
	return fetchJSON<ExploreResponse>(
		`/api/0/explore?targets=${encodeURIComponent(targetParam)}`,
		ExploreResponseSchema,
		undefined,
		'explore response'
	);
}

export async function fetchReach(body: ReachRequest): Promise<ReachResponse> {
	assertSchema<ReachRequest>(ReachRequestSchema, body, 'reach request');
	return fetchJSON<ReachResponse>(
		'/api/0/reach',
		ReachResponseSchema,
		{
			method: 'POST',
			body: JSON.stringify(body),
		},
		'reach response'
	);
}

export async function fetchGap(body: GapRequest): Promise<GapResponse> {
	assertSchema<GapRequest>(GapRequestSchema, body, 'gap request');
	return fetchJSON<GapResponse>(
		'/api/0/gap',
		GapResponseSchema,
		{
			method: 'POST',
			body: JSON.stringify(body),
		},
		'gap response'
	);
}
