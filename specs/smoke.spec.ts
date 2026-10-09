import { test, expect } from '@wordpress/e2e-test-utils-playwright';

// PHP errors printed into the page by WP_DEBUG, with or without <b> wrapping.
const PHP_ERROR =
	/(?:<b>)?(?:Fatal error|Warning|Notice|Deprecated|Parse error)(?:<\/b>)?:\s/;

test.describe( 'fresh install smoke', () => {
	test( 'the tekseries theme is active', async ( { requestUtils } ) => {
		const themes = await requestUtils.rest< { stylesheet: string }[] >( {
			path: '/wp/v2/themes',
			params: { status: 'active' },
		} );
		expect( themes[ 0 ]?.stylesheet ).toBe( 'tekseries' );
	} );

	test( 'the tekseries-blocks plugin is active', async ( {
		requestUtils,
	} ) => {
		const plugin = await requestUtils.rest< { status: string } >( {
			path: '/wp/v2/plugins/tekseries-blocks/tekseries-blocks',
		} );
		expect( plugin.status ).toBe( 'active' );
	} );

	test( 'the front page renders with no PHP errors', async ( { page } ) => {
		const response = await page.goto( '/' );
		expect( response?.status() ).toBe( 200 );
		await expect( page.locator( 'body' ) ).toHaveClass(
			/\bwp-theme-tekseries\b/
		);
		expect( await page.content() ).not.toMatch( PHP_ERROR );
	} );

	test( 'wp-admin renders with no PHP errors', async ( { admin, page } ) => {
		await admin.visitAdminPage( '/' );
		expect( await page.content() ).not.toMatch( PHP_ERROR );
	} );
} );
