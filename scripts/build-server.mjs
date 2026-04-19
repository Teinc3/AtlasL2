import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { build } from 'esbuild';


const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const serverRoot = path.join(repoRoot, 'server');
const distRoot = path.join(repoRoot, 'dist', 'server');


fs.rmSync(distRoot, { recursive: true, force: true });
fs.mkdirSync(distRoot, { recursive: true });


await build({
	entryPoints: [path.join(serverRoot, 'src/main.ts')],
	bundle: true,
	platform: 'node',
	format: 'cjs',
	target: 'node20',
	outdir: distRoot,
	outExtension: { '.js': '.cjs' },
	sourcemap: true,
	logLevel: 'info',
});