import { defineConfig } from 'vitest/config';

// Scoped includes: the repo root is the WordPress root, so the default glob
// would crawl core, third-party plugins and the Playwright specs.
export default defineConfig( {
	test: {
		environment: 'node',
		include: [
			'tests/unit/**/*.test.ts',
			'wp-content/plugins/tekseries-blocks/src/**/*.test.{ts,tsx}',
		],
	},
} );
