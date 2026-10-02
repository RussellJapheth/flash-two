import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		port: 5190,
		host: 'localhost',
		watch: {
			ignored: ['**/tmp/**', '**/.git/**']
		}
	},
	preview: {
		port: 5190
	},
	test: {
		expect: { requireAssertions: true },
		environment: 'node',
		env: { PUBLIC_API_BASE_URL: 'http://localhost.test' },
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
