import { Value } from '@sinclair/typebox/value';

import type { TSchema } from '@sinclair/typebox';


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
