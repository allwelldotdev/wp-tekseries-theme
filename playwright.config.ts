import { readFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from '@playwright/test';
import baseConfig from '@wordpress/scripts/config/playwright.config.js';

// .wp-env.json owns the port; WP_BASE_URL / WP_ENV_PORT override it, as in wp-env.
// wp-env's separate tests environment is disabled, so wp-scripts can't infer this itself.
const { port } = JSON.parse(
	readFileSync( path.join( __dirname, '.wp-env.json' ), 'utf8' )
) as { port: number };
const baseURL =
	process.env.WP_BASE_URL ??
	`http://localhost:${ process.env.WP_ENV_PORT ?? port }`;
// e2e-test-utils reads WP_BASE_URL from the environment (default :8889) for REST
// login; global setup and the workers inherit it from here.
process.env.WP_BASE_URL = baseURL;

export default defineConfig( {
	...baseConfig,
	// Absolute: a relative testDir resolves against the base config inside node_modules.
	testDir: path.join( __dirname, 'specs' ),
	use: { ...baseConfig.use, baseURL },
	webServer: {
		command: 'npm run wp-env start',
		url: baseURL,
		timeout: 120_000,
		reuseExistingServer: true,
	},
} );
