import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { invalidBlocks } from './utils/blocks';

type Linked = { id: number; link: string };

const VISITOR = { storageState: { cookies: [], origins: [] } };
// The test config asks for less motion everywhere; these pages want it on.
const MOVING = { ...VISITOR, reducedMotion: 'no-preference' } as const;

const MARKED = /is-reveal-pending|is-revealed/;
const opacity = ( element: Element ) =>
	window.getComputedStyle( element ).opacity;
const animation = ( element: Element ) =>
	window.getComputedStyle( element ).animationName;
// The number a stat shows: a CSS counter.
const count = ( stat: Element ) =>
	window.getComputedStyle( stat.querySelector( '.ts-stat__number' ) ?? stat )
		.counterReset;

// Blocks with the class "ts-reveal", and stats, play the first time a visitor
// scrolls to them. The script only marks them; the stylesheets do the rest, so
// without it the page is simply all there.
test.describe( 'reveal on scroll', () => {
	let made: Linked;
	// A marked group holding marked blocks: one deeper in, one of its own
	// children far down.
	let nested: Linked;

	test.beforeAll( async ( { requestUtils } ) => {
		made = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Reveal',
				status: 'publish',
				content: [
					'<!-- wp:heading {"className":"ts-reveal e2e-seen"} --><h2 class="wp-block-heading ts-reveal e2e-seen">On screen</h2><!-- /wp:heading -->',
					'<!-- wp:tekseries/stat {"value":7,"className":"e2e-seen"} /-->',
					'<!-- wp:spacer {"height":"2000px"} --><div style="height:2000px" aria-hidden="true" class="wp-block-spacer"></div><!-- /wp:spacer -->',
					'<!-- wp:heading {"className":"ts-reveal e2e-far"} --><h2 class="wp-block-heading ts-reveal e2e-far">Further down</h2><!-- /wp:heading -->',
					'<!-- wp:group {"className":"ts-reveal e2e-far","layout":{"type":"constrained"}} --><div class="wp-block-group ts-reveal e2e-far"><!-- wp:paragraph --><p>One</p><!-- /wp:paragraph --><!-- wp:paragraph --><p>Two <a href="#further">link</a></p><!-- /wp:paragraph --></div><!-- /wp:group -->',
					'<!-- wp:tekseries/stat {"value":312,"className":"e2e-far"} /-->',
					'<!-- wp:tekseries/stat {"value":40,"suffix":"%","className":"e2e-far"} /-->',
				].join( '' ),
			},
		} );

		const group = ( className: string, inner: string ) =>
			`<!-- wp:group {${
				className ? `"className":"${ className }",` : ''
			}"layout":{"type":"constrained"}} --><div class="wp-block-group${
				className ? ` ${ className }` : ''
			}">${ inner }</div><!-- /wp:group -->`;
		const paragraph = ( text: string ) =>
			`<!-- wp:paragraph --><p>${ text }</p><!-- /wp:paragraph -->`;
		const spacer = ( height: number ) =>
			`<!-- wp:spacer {"height":"${ height }px"} --><div style="height:${ height }px" aria-hidden="true" class="wp-block-spacer"></div><!-- /wp:spacer -->`;
		nested = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Reveal Nested',
				status: 'publish',
				content:
					spacer( 2000 ) +
					group(
						'ts-reveal e2e-outer',
						paragraph( 'First' ) +
							paragraph( 'Second' ) +
							group(
								'',
								group(
									'ts-reveal e2e-inner',
									paragraph( 'One' ) + paragraph( 'Two' )
								)
							) +
							spacer( 1500 ) +
							'<!-- wp:paragraph {"className":"ts-reveal e2e-last"} --><p class="ts-reveal e2e-last">Last</p><!-- /wp:paragraph -->'
					),
			},
		} );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		for ( const { id } of [ made, nested ] ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/pages/${ id }`,
				params: { force: true },
			} );
		}
	} );

	test( 'a block below the screen waits, then rises in when it is scrolled to', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( MOVING );
		const page = await context.newPage();
		await page.goto( made.link );
		const seen = page.locator( 'h2.e2e-seen' );
		const far = page.locator( 'h2.e2e-far' );
		const card = page.locator( '.wp-block-group.e2e-far' );

		// One the visitor can already see is left as it is.
		await expect( far ).toHaveClass( /is-reveal-pending/ );
		await expect( seen ).not.toHaveClass( MARKED );
		expect( await seen.evaluate( opacity ) ).toBe( '1' );
		expect( await far.evaluate( opacity ) ).toBe( '0' );
		await expect( card ).toHaveClass( /is-reveal-pending/ );

		await far.scrollIntoViewIfNeeded();
		await expect( far ).toHaveClass( /is-revealed/ );
		await expect( far ).not.toHaveClass( /is-reveal-pending/ );
		expect( await far.evaluate( animation ) ).toBe( 'ts-reveal-rise' );
		await expect.poll( () => far.evaluate( opacity ) ).toBe( '1' );

		// A group comes from further down, and its contents follow in turn.
		await expect( card ).toHaveClass( /is-revealed/ );
		expect(
			await card.evaluate( ( group ) => {
				const style = window.getComputedStyle( group );
				return [
					style.animationDuration,
					style.getPropertyValue( '--ts-reveal-distance' ),
				];
			} )
		).toEqual( [ '0.9s', '64px' ] );
		expect(
			await card
				.locator( '> p' )
				.evaluateAll( ( items ) =>
					items.map( ( item ) =>
						parseFloat(
							window.getComputedStyle( item ).animationDelay
						).toFixed( 2 )
					)
				)
		).toEqual( [ '0.20', '0.30' ] );
		await context.close();
	} );

	test( 'a marked block inside a marked group keeps its own turn', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( MOVING );
		const page = await context.newPage();
		await page.goto( nested.link );
		const outer = page.locator( '.e2e-outer' );
		const inner = page.locator( '.e2e-inner' );
		const last = page.locator( '.e2e-last' );
		const delays = ( items: Element[] ) =>
			items.map( ( item ) =>
				parseFloat(
					window.getComputedStyle( item ).animationDelay
				).toFixed( 2 )
			);
		await expect( outer ).toHaveClass( /is-reveal-pending/ );

		await outer.locator( '> p' ).first().scrollIntoViewIfNeeded();
		await expect( outer ).toHaveClass( /is-revealed/ );
		await expect( inner ).toHaveClass( /is-revealed/ );
		// The group's own contents follow it; so do the inner group's, from
		// its first, whatever place the inner group has in the outer one.
		expect(
			await outer.locator( '> p:not(.ts-reveal)' ).evaluateAll( delays )
		).toEqual( [ '0.20', '0.30' ] );
		expect( await inner.locator( '> p' ).evaluateAll( delays ) ).toEqual( [
			'0.20',
			'0.30',
		] );
		// The marked child far down has not been reached: it still waits,
		// and does not play as part of the group's contents.
		await expect( last ).toHaveClass( /is-reveal-pending/ );
		expect( await last.evaluate( animation ) ).toBe( 'none' );
		expect( await last.evaluate( opacity ) ).toBe( '0' );

		// Scrolled to, it plays its own entrance.
		await last.scrollIntoViewIfNeeded();
		await expect( last ).toHaveClass( /is-revealed/ );
		expect(
			await last.evaluate( ( element ) => {
				const style = window.getComputedStyle( element );
				return [ style.animationName, style.animationDuration ];
			} )
		).toEqual( [ 'ts-reveal-rise', '0.8s' ] );
		await expect.poll( () => last.evaluate( opacity ) ).toBe( '1' );
		await context.close();
	} );

	test( 'a stat below the screen counts when it is scrolled to, one on screen from the start', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( MOVING );
		const page = await context.newPage();
		await page.goto( made.link );
		const seen = page.locator( '.wp-block-tekseries-stat.e2e-seen' );
		const far = page.locator( '.wp-block-tekseries-stat.e2e-far' );
		const number = far.first().locator( '.ts-stat__number' );

		await expect( far.first() ).toHaveClass( /is-reveal-pending/ );
		await expect( seen ).not.toHaveClass( MARKED );
		await expect.poll( () => seen.evaluate( count ) ).toBe( 'ts-stat 7' );
		// Waiting, the figure stands at 0.
		expect( await far.first().evaluate( count ) ).toBe( 'ts-stat 0' );
		expect( await number.evaluate( animation ) ).toBe( 'none' );

		await page
			.locator( '.wp-block-group.e2e-far' )
			.scrollIntoViewIfNeeded();
		await expect( far.nth( 1 ) ).toHaveClass( /is-revealed/ );
		// Blocks that arrive together take turns, 0.12s apart.
		expect(
			await page
				.locator( '.is-revealed' )
				.evaluateAll( ( blocks ) =>
					blocks.map( ( block ) =>
						( block as HTMLElement ).style.getPropertyValue(
							'--ts-reveal-place'
						)
					)
				)
		).toEqual( [ '0', '1', '2', '3' ] );
		expect(
			await far
				.locator( '.ts-stat__number' )
				.evaluateAll( ( numbers ) =>
					numbers.map( ( item ) =>
						parseFloat(
							window.getComputedStyle( item ).animationDelay
						).toFixed( 2 )
					)
				)
		).toEqual( [ '0.24', '0.36' ] );
		await expect
			.poll( () => far.first().evaluate( count ) )
			.toBe( 'ts-stat 312' );
		await expect
			.poll( () => far.nth( 1 ).evaluate( count ) )
			.toBe( 'ts-stat 40' );
		await context.close();
	} );

	test( 'a waiting block that takes the keyboard focus is shown at once', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( MOVING );
		const page = await context.newPage();
		await page.goto( made.link );
		const card = page.locator( '.wp-block-group.e2e-far' );
		await expect( card ).toHaveClass( /is-reveal-pending/ );
		expect( await card.evaluate( opacity ) ).toBe( '0' );

		// (Focused where it is: scrolled to, it would simply play.)
		await card
			.locator( 'a' )
			.evaluate( ( link: HTMLElement ) =>
				link.focus( { preventScroll: true } )
			);
		expect( await card.evaluate( opacity ) ).toBe( '1' );
		// On screen with the focus still in it, it does not fade in under it,
		// and nor do its contents.
		const shown = ( items: Element[] ) =>
			items.map( ( item ) => {
				const style = window.getComputedStyle( item );
				return `${ style.opacity } ${ style.translate }`;
			} );
		const playing = () =>
			card.evaluate(
				( group ) => group.getAnimations( { subtree: true } ).length
			);
		await card.scrollIntoViewIfNeeded();
		await expect( card ).toHaveClass( /is-revealed/ );
		expect( await card.evaluateAll( shown ) ).toEqual( [ '1 none' ] );
		expect( await card.locator( '> p' ).evaluateAll( shown ) ).toEqual( [
			'1 none',
			'1 none',
		] );

		// Nor does it rise in again once the focus has moved on.
		await expect.poll( playing ).toBe( 0 );
		await card
			.locator( 'a' )
			.evaluate( ( link: HTMLElement ) => link.blur() );
		expect( await playing() ).toBe( 0 );
		expect( await card.evaluateAll( shown ) ).toEqual( [ '1 none' ] );
		await context.close();
	} );

	// The keyboard's focus brings a block to its place at once. A press of the
	// pointer must not: the block would jump from under it, the pointer would
	// be let go beside the link, and there would be no click.
	test( 'a link pressed while its block is still rising in is followed', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( MOVING );
		const page = await context.newPage();
		await page.goto( made.link );
		// Slowed to a crawl, so the block is on its way all through the test.
		await page.addStyleTag( {
			content:
				'html { scroll-behavior: auto !important; } .ts-reveal.is-revealed, .ts-reveal.is-revealed > * { animation-duration: 600s !important; animation-delay: 0s !important; animation-timing-function: linear !important; }',
		} );
		const card = page.locator( '.wp-block-group.e2e-far' );
		await card.scrollIntoViewIfNeeded();
		await expect( card ).toHaveClass( /is-revealed/ );
		expect(
			await card.evaluate(
				( group ) => group.getAnimations( { subtree: true } ).length
			)
		).toBeGreaterThan( 0 );

		const link = card.locator( 'a' );
		const before = await link.boundingBox();
		await page.mouse.move(
			( before?.x ?? 0 ) + ( before?.width ?? 0 ) / 2,
			( before?.y ?? 0 ) + ( before?.height ?? 0 ) / 2
		);
		await page.mouse.down();
		const held = await link.boundingBox();
		await page.mouse.up();
		expect(
			Math.abs( ( held?.y ?? 0 ) - ( before?.y ?? 0 ) )
		).toBeLessThan( 2 );
		// Pressed, it is in full view all the same.
		expect( await card.evaluate( opacity ) ).toBe( '1' );
		await expect( page ).toHaveURL( /#further$/ );
		await context.close();
	} );

	test( 'nothing waits without JavaScript, with less motion or on paper', async ( {
		browser,
	} ) => {
		// No script: nothing is marked, and the stats count from the start.
		const plain = await browser.newContext( {
			...MOVING,
			javaScriptEnabled: false,
		} );
		let page = await plain.newPage();
		await page.goto( made.link );
		let far = page.locator( 'h2.e2e-far' );
		let stat = page.locator( '.wp-block-tekseries-stat.e2e-far' ).first();
		await expect( far ).not.toHaveClass( MARKED );
		expect( await far.evaluate( opacity ) ).toBe( '1' );
		await expect.poll( () => stat.evaluate( count ) ).toBe( 'ts-stat 312' );
		await plain.close();

		// Less motion: the script marks nothing. (It has run by now: with
		// motion, the marks are there well before this.)
		const still = await browser.newContext( {
			...VISITOR,
			reducedMotion: 'reduce',
		} );
		page = await still.newPage();
		await page.goto( made.link );
		await page.waitForLoadState( 'load' );
		await page.evaluate(
			() =>
				new Promise( ( done ) =>
					window.requestAnimationFrame( () =>
						window.setTimeout( done, 250 )
					)
				)
		);
		far = page.locator( 'h2.e2e-far' );
		stat = page.locator( '.wp-block-tekseries-stat.e2e-far' ).first();
		await expect( far ).not.toHaveClass( MARKED );
		await expect( stat ).not.toHaveClass( MARKED );
		expect( await stat.evaluate( count ) ).toBe( 'ts-stat 312' );
		await still.close();

		// Asked for less motion, or printed, while blocks wait: they are
		// all there, with their numbers.
		const moving = await browser.newContext( MOVING );
		page = await moving.newPage();
		await page.goto( made.link );
		far = page.locator( 'h2.e2e-far' );
		stat = page.locator( '.wp-block-tekseries-stat.e2e-far' ).first();
		await expect( far ).toHaveClass( /is-reveal-pending/ );
		for ( const media of [
			{ reducedMotion: 'reduce' },
			{ reducedMotion: 'no-preference', media: 'print' },
		] as const ) {
			await page.emulateMedia( media );
			expect( await far.evaluate( opacity ) ).toBe( '1' );
			expect( await stat.evaluate( count ) ).toBe( 'ts-stat 312' );
		}
		await moving.close();
	} );

	test( 'loads its script for marked blocks and stats, which stay valid in the editor', async ( {
		admin,
		browser,
		page,
	} ) => {
		const context = await browser.newContext( VISITOR );
		const visitor = await context.newPage();
		const scripts: string[] = [];
		visitor.on( 'request', ( request ) => scripts.push( request.url() ) );
		await visitor.goto( made.link );
		expect(
			scripts
				.filter( ( url ) =>
					/react|jquery|tekseries-blocks\/build\/.*\.js/i.test( url )
				)
				.map( ( url ) => url.replace( /^.*\/build\/|\?.*$/g, '' ) )
		).toEqual( [ 'reveal/view.js' ] );
		// Marked blocks and stats are handed to the script; others are not.
		await expect(
			visitor.locator( '[data-wp-init---reveal]' )
		).toHaveCount( 3 );
		await expect(
			visitor.locator( '.wp-block-tekseries-stat[data-wp-init]' )
		).toHaveCount( 3 );
		await context.close();

		await admin.editPost( made.id );
		expect( await invalidBlocks( page ) ).toEqual( [] );
	} );
} );
