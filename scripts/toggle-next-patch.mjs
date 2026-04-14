import fs from 'node:fs';
import path from 'node:path';

const mode = process.argv[2];
const rootDir = process.cwd();
const nextComponentsDir = path.join(rootDir, 'node_modules/next/dist/client/components');
const stockDir = path.join(rootDir, 'patches/next-stock/dist/client/components');
const patchedDir = path.join(rootDir, 'patches/next-patched/dist/client/components');
const files = ['redirect-boundary.js', 'redirect-boundary.d.ts', 'layout-router.js'];
const markerStart = '/* redirect-test-patch:';

function ensureInstalled() {
  if (!fs.existsSync(nextComponentsDir)) {
    console.error('Next.js is not installed in this repo yet. Run `pnpm install` first.');
    process.exit(1);
  }
}

function readLayoutRouterMarker() {
  const filePath = path.join(nextComponentsDir, 'layout-router.js');
  if (!fs.existsSync(filePath)) {
    return 'missing';
  }
  const source = fs.readFileSync(filePath, 'utf8');
  if (source.startsWith(`${markerStart} patched */`)) {
    return 'patched';
  }
  if (source.startsWith(`${markerStart} stock */`)) {
    return 'stock';
  }
  return 'unknown';
}

function writeMode(targetMode) {
  const sourceDir = targetMode === 'patched' ? patchedDir : stockDir;

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(nextComponentsDir, file);
    const source = fs.readFileSync(sourcePath, 'utf8');
    const withMarker = `${markerStart} ${targetMode} */\n${source}`;

    fs.writeFileSync(targetPath, withMarker);
  }

  console.log(`Applied ${targetMode} RedirectBoundary patch set.`);
}

ensureInstalled();

if (mode === 'status') {
  console.log(readLayoutRouterMarker());
  process.exit(0);
}

if (mode !== 'stock' && mode !== 'patched') {
  console.error('Usage: node scripts/toggle-next-patch.mjs [stock|patched|status]');
  process.exit(1);
}

writeMode(mode);
