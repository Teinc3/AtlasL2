import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


function updateDeps(pkg: Record<string, any>, newVersion: string) {
  for (const depType of ['dependencies', 'devDependencies', 'peerDependencies']) {
    if (pkg[depType] && typeof pkg[depType] === 'object') {
      for (const [depName, depVersion] of Object.entries(pkg[depType])) {
        if (depName.startsWith('@atlasl2/') && typeof depVersion === 'string') {
          // Skip workspace protocol
          if (depVersion === 'workspace:*') {
            continue;
          }
          
          // Extract prefix (^, ~, =, >=, etc.) and update version
          const match = depVersion.match(/^([~^>=]*)?(.+)$/);
          if (match) {
            const prefix = match[1] || '';
            pkg[depType][depName] = prefix + newVersion;
          }
        }
      }
    }
  }
}


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Error: Version argument is required');
  console.error('Usage: npm run bump -- <version>');
  process.exit(1);
}

// Basic semver validation (allows x.y.z, x.y.z-hotfix etc.)
const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
if (!semverRegex.test(newVersion)) {
  console.error(`Error: Invalid version format "${newVersion}", expected format: x.y.z (e.g. 0.1.2)`);
  process.exit(1);
}

// Package.json file paths
const packagePaths = [
  path.join(rootDir, 'package.json'),
  path.join(rootDir, 'client', 'package.json'),
  path.join(rootDir, 'server', 'package.json'),
  path.join(rootDir, 'shared', 'package.json'),
];

let successCount = 0;
let failureCount = 0;
let oldVersion = '';


for (const pkgPath of packagePaths) {
  try {
    if (!fs.existsSync(pkgPath)) {
      console.warn(`${pkgPath} not found, skipping`);
      continue;
    }

    const content = fs.readFileSync(pkgPath, 'utf-8');
    const pkg = JSON.parse(content);
    
    if (!oldVersion && pkg.version) {
      oldVersion = pkg.version;
    }
    pkg.version = newVersion;
    updateDeps(pkg, newVersion);

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`${path.relative(rootDir, pkgPath)}: ${oldVersion} → ${newVersion}`);
    successCount++;

  } catch (error) {
    console.error(`${pkgPath}: ${error instanceof Error ? error.message : String(error)}`);
    failureCount++;
  }
}

console.log(`\nSummary: ${successCount} updated, ${failureCount} failed`);
process.exit(failureCount > 0 ? 1 : 0);
