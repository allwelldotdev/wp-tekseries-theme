import { test, expect } from '@wordpress/e2e-test-utils-playwright';

type Icon = { name: string; label: string; content: string };

test.describe( 'tekseries icon collection', () => {
	test( 'the icons API lists the collection', async ( { requestUtils } ) => {
		const icons = await requestUtils.rest< Icon[] >( {
			path: '/wp/v2/icons/tekseries',
		} );
		expect( icons.length ).toBeGreaterThan( 100 );
		expect(
			icons.find( ( icon ) => icon.name === 'tekseries/calendar_month' )
		).toMatchObject( {
			label: 'Calendar',
			content: expect.stringContaining( '<svg' ),
		} );
	} );

	test( 'an Icon block renders the SVG on the front end', async ( {
		page,
		requestUtils,
	} ) => {
		const post = await requestUtils.createPage( {
			title: 'E2E Icon',
			status: 'publish',
			content:
				'<!-- wp:icon {"icon":"tekseries/school","style":{"dimensions":{"width":"30px"}}} /-->',
		} );
		await page.goto( `/?page_id=${ post.id }` );
		const svg = page.locator( '.wp-block-icon svg' );
		await expect( svg ).toHaveAttribute( 'aria-hidden', 'true' );
		await expect( svg ).toHaveCSS( 'width', '30px' );
		await requestUtils.deleteAllPages();
	} );
} );
