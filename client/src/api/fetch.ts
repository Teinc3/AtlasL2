import { Value } from '@sinclair/typebox/value';

import type { TSchema } from '@sinclair/typebox';


function normaliseBase(base: string): string {
	const trimmed = base.trim();
	const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
	const collapsedSlashes = withLeadingSlash.replace(/\/+/g, '/');
	const withoutTrailingSlash = collapsedSlashes.replace(/\/+$/, '');

	return withoutTrailingSlash === '' ? '/' : `${withoutTrailingSlash}/`;
}

export function buildClientPath(path: string): string {
	const base = normaliseBase(import.meta.env.BASE_URL ?? '/');
	const relativePath = path.replace(/^\/+/, '');

	if (base === '/') {
		return `/${relativePath}`;
	}
	return `${base}${relativePath}`;
}


export function assertSchema<T>(schema: TSchema, payload: unknown, name: string): T {
	if (!Value.Check(schema, payload)) {
		throw new Error(`Invalid ${name} payload`);
	}
	return payload as T;
}

export async function fetchJSON<T>(
	path: string, schema: TSchema, init?: RequestInit, name = 'response'
): Promise<T> {
	const response = await fetch(path, {
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
