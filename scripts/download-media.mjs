import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Runs only during deployment, not in the Worker or browser. Preserve CDN paths so catalogue rows need no rewriting.
export async function downloadMedia(entries, destination, fetcher = fetch) {
  const root = path.resolve(destination);
  let cursor = 0;
  let bytes = 0;
  await Promise.all(Array.from({ length: Math.min(6, entries.length) }, async () => {
    for (;;) {
      const entry = entries[cursor++];
      if (!entry) return;
      if (!entry.path.startsWith('/__l5e/assets-v1/')) throw new Error('Unsupported media path');
      const target = path.resolve(root, `.${entry.path}`);
      if (!target.startsWith(`${root}${path.sep}`)) throw new Error('Unsafe media path');
      let last;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await fetcher(entry.source, { signal: AbortSignal.timeout(60_000) });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const type = response.headers.get('content-type') ?? '';
          if (type.includes('text/html') || type.includes('application/json')) throw new Error('Expected media, received document');
          const body = new Uint8Array(await response.arrayBuffer());
          if (!body.length) throw new Error('Empty media file');
          await mkdir(path.dirname(target), { recursive: true });
          await writeFile(target, body); bytes += body.length; last = undefined; break;
        } catch (error) { last = error; }
      }
      if (last) throw new Error(`Could not download ${entry.path}: ${last.message}`);
    }
  }));
  return { files: entries.length, bytes };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const manifest = process.argv[2] ?? 'scripts/media-manifest.json';
  const output = process.argv[3] ?? 'public';
  const result = await downloadMedia(JSON.parse(await readFile(manifest, 'utf8')), output);
  console.log(`Downloaded ${result.files} files (${Math.round(result.bytes / 1024 / 1024)} MB)`);
}
