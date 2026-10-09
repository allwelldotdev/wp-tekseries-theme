import { test, expect } from '@wordpress/e2e-test-utils-playwright';

type Linked = { id: number; link: string };

// Each front-end template renders a main region with no PHP notices and no
// unrendered shortcodes (the old Divi builder left `[et_pb_…]` behind).
test.describe( 'front-end templates', () => {
	let event: Linked;
	let post: Linked;

	test.beforeAll( async ( { requestUtils } ) => {
		event = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/event',
			data: {
				title: 'E2E Template Event',
				status: 'publish',
				content: 'An event.',
			},
		} );
		post = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/posts',
			data: {
				title: 'E2E Template Post',
				status: 'publish',
				content: 'A news post.',
			},
		} );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.rest( {
			method: 'DELETE',
			path: `/wp/v2/event/${ event.id }`,
			params: { force: true },
		} );
		await requestUtils.deleteAllPosts();
	} );

	const pages: [ string, () => string, number ][] = [
		[ 'events listing', () => '/events/', 200 ],
		[ 'single event', () => event.link, 200 ],
		[ 'single post', () => post.link, 200 ],
		[ 'search', () => '/?s=E2E', 200 ],
		[ '404', () => '/no-such-page-e2e/', 404 ],
	];

	for ( const [ name, url, status ] of pages ) {
		test( `${ name } renders cleanly`, async ( { page } ) => {
			const response = await page.goto( url() );
			expect( response?.status() ).toBe( status );
			await expect( page.locator( 'main' ) ).toBeVisible();
			await expect( page.locator( '.is-style-hero-plum' ) ).toBeVisible();
			const text = await page.locator( 'body' ).innerText();
			expect( text ).not.toMatch( /\[(et_pb|difl)_/ );
			expect( text ).not.toMatch(
				/(Warning|Notice|Fatal error|Deprecated):/
			);
		} );
	}
} );
