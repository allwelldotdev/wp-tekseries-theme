import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { setUpJobPages, type JobPages } from './utils/wpjm';

const HOST_CSS = '#wp-site-designer-contrast-fallback';
const CLEAR = 'rgba(0, 0, 0, 0)';

// On live, GoDaddy's platform plugin prints a stylesheet whose rules outrank
// the theme's on every field and submit button, and it reads colour presets
// the theme doesn't have: fields lost their borders and backgrounds. The test
// site prints the same rules (specs/fixtures/host-contrast-css.php); the theme
// takes them out of the head.
test.describe( 'host-injected form styles', () => {
	let pages: JobPages;

	test.beforeAll( async ( { requestUtils, browser } ) => {
		const admin = await browser.newPage();
		pages = await setUpJobPages( requestUtils, admin );
		await admin.close();
	} );

	test( 'the Events search field keeps its border and background', async ( {
		page,
	} ) => {
		await page.goto( '/events/' );
		await expect( page.locator( HOST_CSS ) ).toHaveCount( 0 );
		const field = page.locator(
			'.ts-event-search__form input[type="search"]'
		);
		await expect( field ).toHaveCSS( 'border-top-style', 'solid' );
		await expect( field ).toHaveCSS( 'border-top-width', '1px' );
		await expect( field ).not.toHaveCSS( 'background-color', CLEAR );
	} );

	test( 'the job form keeps its fields and its Preview button', async ( {
		page,
	} ) => {
		await page.goto( pages.submit.link );
		await expect( page.locator( HOST_CSS ) ).toHaveCount( 0 );
		const title = page.locator( '#job_title' );
		await expect( title ).toHaveCSS( 'border-top-style', 'solid' );
		await expect( title ).not.toHaveCSS( 'background-color', CLEAR );
		const preview = page.getByRole( 'button', { name: 'Preview' } );
		await expect( preview ).not.toHaveCSS( 'background-color', CLEAR );
		await expect( preview ).toHaveCSS( 'padding-left', '28px' );
	} );
} );
