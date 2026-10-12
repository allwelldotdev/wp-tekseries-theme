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

	// Listings and utility pages open with the plum hero; singles with the
	// post's tone banner (Post Tone block).
	const HERO = '.is-style-hero-plum';
	const BANNER = '.wp-block-tekseries-post-tone.ts-banner';
	const pages: [ string, () => string, number, string ][] = [
		[ 'events listing', () => '/events/', 200, HERO ],
		[ 'single event', () => event.link, 200, BANNER ],
		[ 'single post', () => post.link, 200, BANNER ],
		[ 'search', () => '/?s=E2E', 200, HERO ],
		[ '404', () => '/no-such-page-e2e/', 404, HERO ],
	];

	for ( const [ name, url, status, hero ] of pages ) {
		test( `${ name } renders cleanly`, async ( { page } ) => {
			const response = await page.goto( url() );
			expect( response?.status() ).toBe( status );
			await expect( page.locator( 'main' ) ).toBeVisible();
			await expect( page.locator( hero ) ).toBeVisible();
			const text = await page.locator( 'body' ).innerText();
			expect( text ).not.toMatch( /\[(et_pb|difl)_/ );
			expect( text ).not.toMatch(
				/(Warning|Notice|Fatal error|Deprecated):/
			);
		} );
	}

	// The event filter tabs: 44px pills, 8px apart. On a phone they stay on
	// one row that scrolls sideways while the page itself does not.
	test( 'event filter tabs keep their size and scroll on a phone', async ( {
		page,
	} ) => {
		await page.goto( '/events/' );
		const nav = page.getByRole( 'navigation', { name: 'Filter events' } );
		const measure = () =>
			nav.getByRole( 'link' ).evaluateAll( ( links ) => {
				const boxes = links.map( ( link ) =>
					link.getBoundingClientRect()
				);
				return {
					heights: boxes.map( ( box ) => box.height ),
					rows: new Set( boxes.map( ( box ) => box.top ) ).size,
					gaps: boxes
						.map(
							( box, i ) =>
								box.left - ( boxes[ i - 1 ]?.right ?? NaN )
						)
						.slice( 1 ),
				};
			} );

		let tabs = await measure();
		expect( tabs.heights ).toEqual( [ 44, 44, 44, 44 ] );
		expect( tabs.gaps ).toEqual( [ 8, 8, 8 ] );

		await page.setViewportSize( { width: 390, height: 844 } );
		tabs = await measure();
		expect( tabs.heights ).toEqual( [ 44, 44, 44, 44 ] );
		expect( tabs.gaps ).toEqual( [ 8, 8, 8 ] );
		expect( tabs.rows ).toBe( 1 );
		expect(
			await nav
				.getByRole( 'list' )
				.evaluate( ( list ) => list.scrollWidth > list.clientWidth )
		).toBe( true );
		expect(
			await page.evaluate(
				() =>
					document.documentElement.scrollWidth -
					document.documentElement.clientWidth
			)
		).toBe( 0 );
	} );
} );
