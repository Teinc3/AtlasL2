import { Value } from '@sinclair/typebox/value';

import {
	CountryMetadataMapSchema, LanguageMetadataMapSchema,
	ExploreResponseSchema,
	GapRequestSchema, GapResponseSchema,
  ReachRequestSchema, ReachResponseSchema,
} from '@atlasl2/shared';

import type { TSchema } from '@sinclair/typebox';
import type {
	CountryMetadataMap, LanguageMetadataMap,
	ExploreResponse,
	GapRequest, GapResponse,
	ReachRequest, ReachResponse,
} from '@atlasl2/shared';


const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

function buildUrl(path: string): string {
	return `${API_BASE_URL}${path}`;
}

function assertSchema<T>(schema: TSchema, payload: unknown, name: string): T {
	if (!Value.Check(schema, payload)) {
		throw new Error(`Invalid ${name} payload`);
	}
	return payload as T;
}

async function fetchJSON<T>(
	path: string, schema: TSchema, init?: RequestInit, name = 'response'
): Promise<T> {
	const response = await fetch(buildUrl(path), {
		headers: {
			'content-type': 'application/json',
			...(init?.headers ?? {}),
		},
		...init,
	});

	if (!response.ok) {
		throw new Error(`Request failed (${response.status}) for ${path}`);
	}

	const json: unknown = await response.json();
	return assertSchema(schema, json, name) as T;
}


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

export { default } from './mockData';
