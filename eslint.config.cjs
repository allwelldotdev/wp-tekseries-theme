// Mirrors the wp-scripts default config, but scopes the Vitest and Playwright rule
// sets to their own folders so they don't apply to each other's files.
const wpPlugin = require( '@wordpress/eslint-plugin' );

const UNIT_TESTS = [
	'tests/unit/**/*.test.{js,ts}',
	'wp-content/plugins/tekseries-blocks/src/**/*.test.{js,jsx,ts,tsx}',
];
const E2E_SPECS = [ 'specs/**/*.spec.{js,ts}' ];

module.exports = [
	{
		ignores: [
			'**/build/**',
			'**/node_modules/**',
			'**/vendor/**',
			'artifacts/**',
		],
	},
	{ files: [ '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts' ] },
	...wpPlugin.configs.recommended,
	...wpPlugin.configs[ 'test-unit' ].map( ( config ) => ( {
		...config,
		files: UNIT_TESTS,
	} ) ),
	...wpPlugin.configs[ 'test-playwright' ].map( ( config ) => ( {
		...config,
		files: E2E_SPECS,
	} ) ),
	{
		languageOptions: {
			parserOptions: {
				requireConfigFile: false,
				babelOptions: {
					presets: [
						require.resolve( '@wordpress/babel-preset-default' ),
					],
				},
			},
		},
	},
];
