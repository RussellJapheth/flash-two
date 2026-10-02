/**
 * Bakes Kenney Food Kit / Furniture Kit GLB models into transparent PNG sprites
 * used by the Restaurant game (2D rendering).
 *
 * Pipeline: esbuild bundles three + GLTFLoader into scripts/bake/bake-bundle.js,
 * a local static server exposes the repository over HTTP, and headless Chromium
 * renders each model on an orthographic 3/4 camera with an alpha background.
 *
 * Source models live in static/models/restaurant/{food,furniture} so a re-bake
 * never needs network access.
 *
 * Usage: pnpm bake:sprites
 */
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
const REPO_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const SPRITE_DIR = join(REPO_ROOT, 'static/images/restaurant/sprites');
const SPRITE_SIZE = 256;

/** Hero art baked outside the sprite loop, e.g. the games-list icon. */
const ICONS = [
	{
		model: 'food/plate-dinner.glb',
		output: join(REPO_ROOT, 'static/images/restaurant/icon.png'),
		size: 512,
		elevationDeg: 36
	}
];

const MIME_TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.glb': 'model/gltf-binary',
	'.png': 'image/png'
};

/** Groups baked from a source model directory, with the camera elevation per group. */
const SPRITE_GROUPS = [
	{ source: 'food', output: 'food', elevationDeg: 32 },
	{ source: 'furniture', output: 'props', elevationDeg: 30 }
];

function startStaticServer() {
	const server = createServer(async (req, res) => {
		const requestedPath = decodeURIComponent((req.url || '/').split('?')[0]);
		const filePath = join(REPO_ROOT, requestedPath);
		if (!filePath.startsWith(REPO_ROOT)) {
			res.writeHead(403).end('Forbidden');
			return;
		}
		try {
			const body = await readFile(filePath);
			res.writeHead(200, {
				'Content-Type': MIME_TYPES[extname(filePath)] || 'application/octet-stream'
			});
			res.end(body);
		} catch {
			res.writeHead(404).end('Not found');
		}
	});

	return new Promise((resolvePort) => {
		server.listen(0, '127.0.0.1', () => {
			const address = server.address();
			resolvePort({ server, port: address.port });
		});
	});
}

async function main() {
	const entry = join(REPO_ROOT, 'scripts/bake/bake-entry.js');
	const bundle = join(REPO_ROOT, 'scripts/bake/bake-bundle.js');

	console.log('Bundling three.js for the bake page...');
	await execFileAsync(join(REPO_ROOT, 'node_modules/.bin/esbuild'), [
		entry,
		'--bundle',
		'--format=iife',
		`--outfile=${bundle}`,
		'--log-level=warning'
	]);

	const { server, port } = await startStaticServer();
	const { chromium } = await import('playwright');
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: SPRITE_SIZE, height: SPRITE_SIZE } });
	page.on('pageerror', (error) => {
		throw error;
	});

	await page.goto(`http://127.0.0.1:${port}/scripts/bake/bake.html`);
	await page.waitForFunction(() => window.bakeReady === true);

	let baked = 0;
	for (const group of SPRITE_GROUPS) {
		const sourceDir = join(REPO_ROOT, 'static/models/restaurant', group.source);
		const outputDir = join(SPRITE_DIR, group.output);
		await mkdir(outputDir, { recursive: true });

		const models = (await readdir(sourceDir)).filter((file) => file.endsWith('.glb')).sort();
		for (const model of models) {
			const name = model.replace(/\.glb$/, '');
			const dataUrl = await page.evaluate(
				([url, size, elevation]) => window.bakeSprite(url, size, elevation),
				[`/static/models/restaurant/${group.source}/${model}`, SPRITE_SIZE, group.elevationDeg]
			);
			await writeFile(join(outputDir, `${name}.png`), Buffer.from(dataUrl.split(',')[1], 'base64'));
			baked += 1;
			console.log(`  baked ${group.output}/${name}.png`);
		}
	}

	for (const icon of ICONS) {
		const dataUrl = await page.evaluate(
			([url, size, elevation]) => window.bakeSprite(url, size, elevation),
			[`/static/models/restaurant/${icon.model}`, icon.size, icon.elevationDeg]
		);
		await mkdir(join(icon.output, '..'), { recursive: true });
		await writeFile(icon.output, Buffer.from(dataUrl.split(',')[1], 'base64'));
		console.log(`  baked icon/${icon.output.split('/').pop()}`);
	}

	await browser.close();
	server.close();
	console.log(`Baked ${baked} sprites into static/images/restaurant/sprites`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
