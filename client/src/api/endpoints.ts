import {
	CountryMetadataMapSchema, LanguageMetadataMapSchema,
	ExploreRequestSchema, ExploreResponseSchema,
	GapRequestSchema, GapResponseSchema,
	ReachRequestSchema, ReachResponseSchema,
} from '@atlasl2/shared';
import { assertSchema, fetchJSON } from './fetch';

import type {
	CountryMetadataMap, LanguageMetadataMap,
	ExploreRequest, ExploreResponse,
	GapRequest, GapResponse,
	ReachRequest, ReachResponse,
} from '@atlasl2/shared';


export async function fetchCountryMetadata(init?: RequestInit): Promise<CountryMetadataMap> {
	return fetchJSON<CountryMetadataMap>(
		'/static/metadata/country_metadata.json',
		CountryMetadataMapSchema,
		init,
		'country metadata'
	);
}

export async function fetchLanguageMetadata(init?: RequestInit): Promise<LanguageMetadataMap> {
	return fetchJSON<LanguageMetadataMap>(
		'/static/metadata/language_metadata.json',
		LanguageMetadataMapSchema,
		init,
		'language metadata'
	);
}

export async function fetchExplore(body: ExploreRequest, init?: RequestInit): Promise<ExploreResponse> {
	assertSchema<ExploreRequest>(ExploreRequestSchema, body, 'explore request');
	return fetchJSON<ExploreResponse>(
		'/api/0/explore',
		ExploreResponseSchema,
		{
			method: 'POST',
			body: JSON.stringify(body),
			...init,
		},
		'explore response'
	);
}

export async function fetchReach(body: ReachRequest, init?: RequestInit): Promise<ReachResponse> {
	assertSchema<ReachRequest>(ReachRequestSchema, body, 'reach request');
	return fetchJSON<ReachResponse>(
		'/api/0/reach',
		ReachResponseSchema,
		{
			method: 'POST',
			body: JSON.stringify(body),
			...init,
		},
		'reach response'
	);
}

export async function fetchGap(body: GapRequest, init?: RequestInit): Promise<GapResponse> {
	assertSchema<GapRequest>(GapRequestSchema, body, 'gap request');
	return fetchJSON<GapResponse>(
		'/api/0/gap',
		GapResponseSchema,
		{
			method: 'POST',
			body: JSON.stringify(body),
			...init,
		},
		'gap response'
	);
}
