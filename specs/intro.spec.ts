import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { invalidBlocks } from './utils/blocks';

type Linked = { id: number; link: string };

// CSS alone, so these pages run without scripts. The test config asks for
// less motion everywhere; they want it on.
const NO_JS = {
	javaScriptEnabled: false,
	storageState: { cookies: [], origins: [] },
};
const MOVING = { ...NO_JS, reducedMotion: 'no-preference' } as const;

// Each block's animation and when it starts.
const rise = ( items: Element[] ) =>
	items.map( ( item ) => {
		const style = window.getComputedStyle( item );
		return `${ style.animationName } ${ parseFloat(
			style.animationDelay
		).toFixed( 2 ) }`;
	} );
const shown = ( items: Element[] ) =>
	items.map( ( item ) => {
		const style = window.getComputedStyle( item );
		return `${ style.opacity } ${ style.translate }`;
	} );
const STILL = 'none 0.00';

// A block with the class "ts-intro" rises in when the page opens, the way the
// Home hero's text does: a Group's blocks one after another, any other block
// by itself.
test.describe( 'entrance on load', () => {
	let made: Linked;

	test.beforeAll( async ( { requestUtils } ) => {
		const group = ( className: string, inner: string ) =>
			`<!-- wp:group {"className":"${ className }","layout":{"type":"constrained"}} --><div class="wp-block-group ${ className }">${ inner }</div><!-- /wp:group -->`;
		const paragraph = ( text: string, className = '' ) =>
			className
				? `<!-- wp:paragraph {"className":"${ className }"} --><p class="${ className }">${ text }</p><!-- /wp:paragraph -->`
				: `<!-- wp:paragraph --><p>${ text }</p><!-- /wp:paragraph -->`;
		const heading = ( text: string, className = '' ) =>
			className
				? `<!-- wp:heading {"className":"${ className }"} --><h2 class="wp-block-heading ${ className }">${ text }</h2><!-- /wp:heading -->`
				: `<!-- wp:heading --><h2 class="wp-block-heading">${ text }</h2><!-- /wp:heading -->`;
		const buttons = ( className = '' ) =>
			`<!-- wp:buttons${
				className ? ` {"className":"${ className }"}` : ''
			} --><div class="wp-block-buttons${
				className ? ` ${ className }` : ''
			}"><!-- wp:button --><div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="#go">Go</a></div><!-- /wp:button --></div><!-- /wp:buttons -->`;

		made = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Intro',
				status: 'publish',
				content: [
					// A hero's text: more blocks than there are places.
					group(
						'ts-intro e2e-copy',
						paragraph( 'Eyebrow' ) +
							heading( 'Heading' ) +
							paragraph(
								'Lead with a <a href="#lead">link</a>'
							) +
							buttons() +
							paragraph( 'Five' ) +
							paragraph( 'Six' ) +
							paragraph( 'Seven' )
					),
					// Blocks marked one by one, with one between them left out.
					group(
						'e2e-row',
						heading( 'Marked', 'ts-intro' ) +
							paragraph( 'Not marked' ) +
							paragraph( 'Marked', 'ts-intro' ) +
							buttons( 'ts-intro' )
					),
					// Marks inside a marked Group, and a decorative icon.
					group(
						'ts-intro e2e-outer',
						paragraph( 'First' ) +
							group(
								'ts-intro e2e-inner',
								paragraph( 'One' ) +
									paragraph( 'Two', 'ts-intro' )
							) +
							'<!-- wp:icon {"icon":"tekseries/work","className":"is-style-deco"} /-->' +
							paragraph( 'Last' )
					),
				].join( '' ),
			},
		} );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.rest( {
			method: 'DELETE',
			path: `/wp/v2/pages/${ made.id }`,
			params: { force: true },
		} );
	} );

	test( 'a marked group’s blocks rise in one after another when the page opens', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( MOVING );
		const page = await context.newPage();
		await page.goto( made.link );
		const copy = page.locator( '.e2e-copy' );

		// The Group stays still, so its background does not move. Its blocks
		// take six places; any after that come with the sixth.
		expect( await copy.evaluateAll( rise ) ).toEqual( [ STILL ] );
		expect( await copy.locator( '> *' ).evaluateAll( rise ) ).toEqual( [
			'ts-intro-rise 0.15',
			'ts-intro-rise 0.27',
			'ts-intro-rise 0.39',
			'ts-intro-rise 0.51',
			'ts-intro-rise 0.63',
			'ts-intro-rise 0.75',
			'ts-intro-rise 0.75',
		] );

		// Once it has played, everything is there.
		await expect
			.poll( () =>
				copy.evaluate(
					( element ) =>
						element.getAnimations( { subtree: true } ).length
				)
			)
			.toBe( 0 );
		expect( await copy.locator( '> *' ).evaluateAll( shown ) ).toEqual(
			Array( 7 ).fill( '1 none' )
		);
		await context.close();
	} );

	test( 'blocks marked one by one take turns, and a mark inside a marked group is left to it', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( MOVING );
		const page = await context.newPage();
		await page.goto( made.link );

		// Each marked block rises in itself, in its place among the marked.
		expect(
			await page.locator( '.e2e-row > *' ).evaluateAll( rise )
		).toEqual( [
			'ts-intro-rise 0.15',
			STILL,
			'ts-intro-rise 0.27',
			'ts-intro-rise 0.39',
		] );

		// The outer Group brings its blocks in, the inner Group as one of
		// them; a decorative icon stays where it is.
		expect(
			await page.locator( '.e2e-outer > *' ).evaluateAll( rise )
		).toEqual( [
			'ts-intro-rise 0.15',
			'ts-intro-rise 0.27',
			STILL,
			'ts-intro-rise 0.51',
		] );
		expect(
			await page.locator( '.e2e-inner > *' ).evaluateAll( rise )
		).toEqual( [ STILL, STILL ] );
		await context.close();
	} );

	test( 'a block the keyboard reaches is shown at once and does not rise in again', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( MOVING );
		const page = await context.newPage();
		await page.goto( made.link );
		const playing = ( block: Element ) => block.getAnimations().length;

		for ( const block of [
			page.locator( '.e2e-copy > :has(a)' ).first(),
			page.locator( '.e2e-row > .wp-block-buttons' ),
		] ) {
			const link = block.locator( 'a' ).first();
			await link.focus();
			expect( await block.evaluateAll( shown ) ).toEqual( [ '1 none' ] );
			await expect.poll( () => block.evaluate( playing ) ).toBe( 0 );
			await link.evaluate( ( element: HTMLElement ) => element.blur() );
			expect( await block.evaluate( playing ) ).toBe( 0 );
			expect( await block.evaluateAll( shown ) ).toEqual( [ '1 none' ] );
		}
		await context.close();
	} );

	test( 'nothing moves with less motion, on paper or in the editor, and no script is loaded', async ( {
		admin,
		browser,
		editor,
		page,
	} ) => {
		const context = await browser.newContext( {
			...MOVING,
			javaScriptEnabled: true,
		} );
		const visitor = await context.newPage();
		const scripts: string[] = [];
		visitor.on( 'request', ( request ) => scripts.push( request.url() ) );
		await visitor.goto( made.link );
		const moved = visitor.locator(
			'.e2e-copy > *, .e2e-row > .ts-intro, .e2e-outer > *'
		);
		expect(
			( await moved.evaluateAll( rise ) ).filter(
				( state ) => state !== STILL
			)
		).toHaveLength( 13 );
		for ( const media of [
			{ reducedMotion: 'reduce' },
			{ reducedMotion: 'no-preference', media: 'print' },
		] as const ) {
			await visitor.emulateMedia( media );
			expect( await moved.evaluateAll( rise ) ).toEqual(
				Array( 14 ).fill( STILL )
			);
		}
		expect(
			scripts.filter( ( url ) =>
				/react|jquery|tekseries-blocks\/build\/.*\.js/i.test( url )
			)
		).toEqual( [] );
		await context.close();

		// The editor shows the blocks as they are, even when motion is
		// welcome, and they stay valid.
		await page.emulateMedia( { reducedMotion: 'no-preference' } );
		await admin.editPost( made.id );
		expect( await invalidBlocks( page ) ).toEqual( [] );
		const blocks = editor.canvas.locator(
			'.e2e-copy > *, .e2e-row > .ts-intro, .e2e-outer > *'
		);
		await expect( blocks ).toHaveCount( 14 );
		expect( await blocks.evaluateAll( rise ) ).toEqual(
			Array( 14 ).fill( STILL )
		);
	} );
} );
