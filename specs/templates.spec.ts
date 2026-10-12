import type { Locator } from '@playwright/test';
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

	// Hero bands: 20px under the header (4px of padding and the 16px block
	// gap), with the text starting at the top of the band. A post's banner
	// is as tall as its content, and its topic icon is never cut at the top.
	test( 'hero bands start 20px under the header with their text at the top', async ( {
		page,
	} ) => {
		const band = () =>
			page.evaluate( () => {
				const header = document
					.querySelector( '.wp-site-blocks > header' )
					?.getBoundingClientRect();
				const hero = document.querySelector(
					'main .is-style-hero-plum, main .ts-banner'
				);
				const box = hero?.getBoundingClientRect();
				const crumbs = hero
					?.querySelector( '.wp-block-breadcrumbs' )
					?.getBoundingClientRect();
				const icon = hero
					?.querySelector( ':scope > .ts-tone__icon' )
					?.getBoundingClientRect();
				const style = hero ? getComputedStyle( hero ) : null;
				return {
					gap: ( box?.top ?? NaN ) - ( header?.bottom ?? NaN ),
					textTop: ( crumbs?.top ?? NaN ) - ( box?.top ?? NaN ),
					padding: parseFloat( style?.paddingTop ?? '' ),
					minHeight: style?.minHeight,
					height: box?.height ?? NaN,
					iconAbove: icon ? ( box?.top ?? NaN ) - icon.top : null,
				};
			} );

		await page.goto( '/events/' );
		let hero = await band();
		expect( hero.gap ).toBe( 20 );
		expect( hero.textTop ).toBeCloseTo( hero.padding, 0 );

		await page.goto( event.link );
		hero = await band();
		expect( hero.gap ).toBe( 20 );
		expect( hero.textTop ).toBeCloseTo( hero.padding, 0 );
		expect( hero.minHeight ).toBe( '0px' );
		expect( hero.height ).toBeLessThan( 480 );
		expect( hero.iconAbove ).toBeLessThanOrEqual( 0 );
	} );
} );

// Controls drawn from the boards: pagination chevrons, the "Read more" arrow
// and the previous/next post cards.
test.describe( 'listing and post controls', () => {
	const events: number[] = [];
	let middle: Linked;

	test.beforeAll( async ( { requestUtils } ) => {
		// The latest card and five in the grid fill page one; the seventh
		// event opens page two.
		for ( let i = 1; i <= 7; i++ ) {
			const { id } = await requestUtils.rest< Linked >( {
				method: 'POST',
				path: '/wp/v2/event',
				data: {
					title: `E2E Paged Event ${ i }`,
					status: 'publish',
					content: 'An event.',
					acf: {
						event_date: `2001010${ i }`,
						time_label: '',
						venue: '',
						cta_link: { title: '', url: '', target: '' },
						cta_name: '',
					},
				},
			} );
			events.push( id );
		}
		const posts: Linked[] = [];
		for ( const [ title, date ] of [
			[ 'E2E Older Post', '2020-01-15T10:00:00' ],
			[ 'E2E Middle Post', '2020-02-15T10:00:00' ],
			[ 'E2E Newer Post', '2020-03-15T10:00:00' ],
		] ) {
			posts.push(
				await requestUtils.rest< Linked >( {
					method: 'POST',
					path: '/wp/v2/posts',
					data: {
						title,
						date,
						status: 'publish',
						content: 'A news post.',
					},
				} )
			);
		}
		middle = posts[ 1 ] as Linked;
	} );

	test.afterAll( async ( { requestUtils } ) => {
		for ( const id of events ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/event/${ id }`,
				params: { force: true },
			} );
		}
		await requestUtils.deleteAllPosts();
	} );

	test( 'pagination keeps a greyed chevron where a page has no neighbour', async ( {
		page,
	} ) => {
		await page.goto( '/events/' );
		const nav = page.locator( '.ts-pagination' );
		const ghost = nav.locator( '.ts-pagination__ghost' );
		const ends = () =>
			nav.evaluate( ( row ) => [
				row.firstElementChild?.className,
				row.lastElementChild?.className,
			] );
		// How far the chevron sits from the middle of its 44px circle.
		const chevron = ( control: Locator ) =>
			control.evaluate( ( circle ) => {
				const box = circle.getBoundingClientRect();
				const arrow = circle
					.querySelector( '[class*="-arrow"]' )
					?.getBoundingClientRect();
				return {
					circle: [ box.width, box.height ],
					size: [ arrow?.width, arrow?.height ],
					off: arrow
						? Math.max(
								Math.abs(
									arrow.left +
										arrow.width / 2 -
										( box.left + box.width / 2 )
								),
								Math.abs(
									arrow.top +
										arrow.height / 2 -
										( box.top + box.height / 2 )
								)
							)
						: NaN,
				};
			} );

		// First page: no previous link, a greyed chevron in its place.
		await expect( ghost ).toHaveCount( 1 );
		await expect( ghost ).toHaveAttribute( 'aria-hidden', 'true' );
		await expect(
			nav.locator( 'a.wp-block-query-pagination-previous' )
		).toHaveCount( 0 );
		const next = nav.locator( 'a.wp-block-query-pagination-next' );
		expect( await ends() ).toEqual( [
			'ts-pagination__ghost',
			await next.getAttribute( 'class' ),
		] );
		for ( const control of [ ghost, next ] ) {
			const drawn = await chevron( control );
			expect( drawn.circle ).toEqual( [ 44, 44 ] );
			expect( drawn.size ).toEqual( [ 24, 24 ] );
			expect( drawn.off ).toBeLessThanOrEqual( 0.5 );
		}
		await expect( nav.locator( '.page-numbers' ).first() ).toHaveCSS(
			'font-size',
			'16px'
		);

		// Last page: the mirror image.
		const last = await nav.locator( '.page-numbers' ).last().innerText();
		await page.goto( `/events/?query-2-page=${ last }` );
		await expect( ghost ).toHaveCount( 1 );
		await expect(
			nav.locator( 'a.wp-block-query-pagination-next' )
		).toHaveCount( 0 );
		const previous = nav.locator( 'a.wp-block-query-pagination-previous' );
		expect( await ends() ).toEqual( [
			await previous.getAttribute( 'class' ),
			'ts-pagination__ghost',
		] );
		for ( const control of [ previous, ghost ] ) {
			const drawn = await chevron( control );
			expect( drawn.size ).toEqual( [ 24, 24 ] );
			expect( drawn.off ).toBeLessThanOrEqual( 0.5 );
		}
	} );

	test( '"Read more" ends in a 20px arrow, and the latest card\'s is a 49px pill', async ( {
		page,
	} ) => {
		await page.goto( '/events/' );
		const pill = page.locator( '.ts-read-more--button' ).first();
		const link = page
			.locator( '.ts-read-more:not(.ts-read-more--button)' )
			.first();
		for ( const more of [ pill, link ] ) {
			expect(
				await more.evaluate( ( el ) => {
					const arrow = getComputedStyle( el, '::after' );
					return [ arrow.width, arrow.height ];
				} )
			).toEqual( [ '20px', '20px' ] );
		}
		await expect( link ).toHaveCSS( 'font-size', '16px' );
		await expect( pill ).toHaveCSS( 'font-size', '17px' );
		expect( ( await pill.boundingBox() )?.height ).toBeCloseTo( 49, 1 );
	} );

	test( 'previous and next post cards show label, title and date', async ( {
		page,
	} ) => {
		await page.goto( middle.link );
		const nav = page.getByRole( 'navigation', { name: 'More posts' } );
		const previous = nav.locator( '.post-navigation-link-previous a' );
		const next = nav.locator( '.post-navigation-link-next a' );

		await expect( previous ).toContainText( 'Previous post' );
		await expect( previous ).toContainText( 'E2E Older Post' );
		await expect( previous.locator( 'time' ) ).toHaveText(
			'January 15, 2020'
		);
		await expect( next ).toContainText( 'Next post' );
		await expect( next ).toContainText( 'E2E Newer Post' );
		await expect( next.locator( 'time' ) ).toHaveText( 'March 15, 2020' );
		await expect( next ).toHaveCSS( 'text-align', 'right' );

		// The arrows are drawn on the labels, not printed as text.
		await expect( nav.locator( '[class*="__arrow-"]' ) ).toHaveCount( 0 );
		expect(
			await previous
				.locator( '.post-navigation-link__label' )
				.evaluate( ( el ) => getComputedStyle( el, '::before' ).width )
		).toBe( '18px' );
		expect(
			await next
				.locator( '.post-navigation-link__label' )
				.evaluate( ( el ) => getComputedStyle( el, '::after' ).width )
		).toBe( '18px' );
	} );
} );
