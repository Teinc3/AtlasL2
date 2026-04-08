import { access, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import type {
	LanguageRelationConfig, LanguageRelationMap,
	AsymmetricEdge, NonTransitiveHub, TransitiveHub,
} from '@atlasl2/shared';


const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const edgesPath = path.join(repoRoot, 'data/relations/edges.json');
const relationMapOut = path.join(repoRoot, 'data/relation_map.json');


// Typeguards
function isTransitiveHub(entry: unknown): entry is TransitiveHub {
	if (typeof entry !== 'object' || entry === null) {
		return false;
	}

	const candidate = entry as Partial<TransitiveHub>;
	return Array.isArray(candidate.languages) && typeof candidate.score === 'number';
}

function isNonTransitiveHub(entry: unknown): entry is NonTransitiveHub {
	if (typeof entry !== 'object' || entry === null) {
		return false;
	}

	const candidate = entry as Partial<NonTransitiveHub>;
	return Array.isArray(candidate.parent) && Array.isArray(candidate.children) && typeof candidate.score === 'number';
}

function isAsymmetricEdge(entry: unknown): entry is AsymmetricEdge {
	if (typeof entry !== 'object' || entry === null) {
		return false;
	}

	const candidate = entry as Partial<AsymmetricEdge>;
	return (
		typeof candidate.parent === 'string'
		&& typeof candidate.child === 'string'
		&& typeof candidate.downstream === 'number'
		&& typeof candidate.upstream === 'number'
	);
}


function setEdge(
	relationMap: LanguageRelationMap,
	fromRaw: string,
	toRaw: string,
	score: number
): void {
	const from = fromRaw.trim().toUpperCase();
	const to = toRaw.trim().toUpperCase();

	if (!from || !to || from === to) {
		return;
	}

	if (!relationMap[from]) {
		relationMap[from] = {};
	}

	const pairKey = `${from}->${to}`;
	const existing = relationMap[from][to];

	if (existing === undefined) {
		relationMap[from][to] = score;
		return;
	}

	if (existing !== score) {
		throw new Error(`${pairKey}: ${score} insert fail (Conflict with ${existing})`);
	}
}

function expandEntry(
	relationMap: LanguageRelationMap,
	entry: unknown,
	index: number
): void {
	const source = `edges.json entry #${index + 1}`;

	if (isTransitiveHub(entry)) {
    // Cartesian product of all languages in the hub
		for (let i = 0; i < entry.languages.length; i += 1) {
			for (let j = i + 1; j < entry.languages.length; j += 1) {
				const left = entry.languages[i];
				const right = entry.languages[j];
				setEdge(relationMap, left, right, entry.score);
				setEdge(relationMap, right, left, entry.score);
			}
		}
		return;
	}

	if (isNonTransitiveHub(entry)) {
    // Cartesian product of all parents to all children
		for (const parent of entry.parent) {
			for (const child of entry.children) {
				setEdge(relationMap, parent, child, entry.score);
        setEdge(relationMap, child, parent, entry.score);
			}
		}
		return;
	}

	if (isAsymmetricEdge(entry)) {
		setEdge(relationMap, entry.parent, entry.child, entry.downstream);
		setEdge(relationMap, entry.child, entry.parent, entry.upstream);
		return;
	}

	throw new Error(`Invalid relation entry shape in ${source}.`);
}


async function main() {
	try {
		await access(relationMapOut);
		console.error(`Error: Output file already exists at '${path.relative(repoRoot, relationMapOut)}'.`);
		process.exit(1);
	} catch {}

	const config = JSON.parse(await readFile(edgesPath, 'utf8')) as LanguageRelationConfig;
	const relationMap: LanguageRelationMap = {};

	for (const [index, entry] of config.entries()) {
		expandEntry(relationMap, entry, index);
	}

	await writeFile(relationMapOut, `${JSON.stringify(relationMap, null, 2)}\n`, 'utf8');

	const languageCount = Object.keys(relationMap).length;
	const edgeCount = Object.values(relationMap).reduce((sum, targets) => sum + Object.keys(targets).length, 0);
	console.log(`Generated '${path.relative(repoRoot, relationMapOut)}' with ${languageCount} languages and ${edgeCount} directed edges.`);
}

main();
