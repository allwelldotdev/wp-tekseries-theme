import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { invalidBlocks } from './utils/blocks';

type Linked = { id: number; link: string };
type Pattern = { name: string; content: string };

const NO_JS = {
	javaScriptEnabled: false,
	storageState: { cookies: [], origins: [] },
};
// The test config asks for less motion everywhere; these pages want it on.
const MOVING = { ...NO_JS, reducedMotion: 'no-preference' } as const;

// The Home blocks that move: the stat count-up, the logo marquee and the hero
// carousel. All three are complete on the server and need no JavaScript.
test.describe( 'home motion blocks', () => {
	let home: Linked;
	const extras: number[] = [];

	test.beforeAll( async ( { requestUtils } ) => {
		// Slides and logos come from the theme's own Home patterns.
		const patterns = await requestUtils.rest< Pattern[] >( {
			path: '/wp/v2/block-patterns/patterns',
		} );
		const content = ( name: string ) =>
			patterns.find( ( pattern ) => pattern.name === name )?.content ??
			'';
		const slide = content( 'tekseries/home-hero' );
		const logos = (
			content( 'tekseries/home-partners' ).match(
				/<!-- wp:image[\s\S]*?<!-- \/wp:image -->/g
			) ?? []
		).join( '' );

		home = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Home Motion',
				status: 'publish',
				content: [
					`<!-- wp:tekseries/hero-carousel -->${ slide }${ slide }<!-- /wp:tekseries/hero-carousel -->`,
					`<!-- wp:tekseries/hero-carousel {"className":"e2e-single"} -->${ slide }<!-- /wp:tekseries/hero-carousel -->`,
					'<!-- wp:tekseries/stat {"value":312} /-->',
					'<!-- wp:tekseries/stat {"value":40,"suffix":"%"} /-->',
					`<!-- wp:tekseries/logo-marquee {"ariaLabel":"E2E partners"} -->${ logos }<!-- /wp:tekseries/logo-marquee -->`,
				].join( '' ),
			},
		} );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		for ( const id of [ home.id, ...extras ] ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/pages/${ id }`,
				params: { force: true },
			} );
		}
	} );

	test( 'a stat counts up to its number, or shows it at once', async ( {
		browser,
	} ) => {
		// The number is a CSS counter; its target is the block's value.
		const target = ( stat: Element ) =>
			window.getComputedStyle(
				stat.querySelector( '.ts-stat__number' ) ?? stat
			).counterReset;

		const moving = await browser.newContext( MOVING );
		let page = await moving.newPage();
		await page.goto( home.link );
		let stats = page.locator( '.wp-block-tekseries-stat' );
		// Assistive technology reads the plain figure, not the animation.
		await expect( stats.locator( '.screen-reader-text' ) ).toHaveText( [
			'312+',
			'40%',
		] );
		await expect(
			stats.first().locator( '> span' ).first()
		).toHaveAttribute( 'aria-hidden', 'true' );
		expect(
			await stats
				.first()
				.locator( '.ts-stat__number' )
				.evaluate(
					( number ) =>
						window.getComputedStyle( number ).animationName
				)
		).toBe( 'ts-stat-count' );
		await expect
			.poll( () => stats.first().evaluate( target ) )
			.toBe( 'ts-stat 312' );
		await moving.close();

		const still = await browser.newContext( {
			...NO_JS,
			reducedMotion: 'reduce',
		} );
		page = await still.newPage();
		await page.goto( home.link );
		stats = page.locator( '.wp-block-tekseries-stat' );
		expect( await stats.nth( 1 ).evaluate( target ) ).toBe( 'ts-stat 40' );
		expect(
			await stats
				.nth( 1 )
				.locator( '.ts-stat__number' )
				.evaluate(
					( number ) =>
						window.getComputedStyle( number ).animationName
				)
		).toBe( 'none' );
		await still.close();
	} );

	test( 'the logo marquee moves, pauses and stays still on request', async ( {
		browser,
	} ) => {
		const moving = await browser.newContext( MOVING );
		let page = await moving.newPage();
		await page.goto( home.link );

		let marquee = page.getByRole( 'region', { name: 'E2E partners' } );
		let strip = marquee.locator( '.ts-marquee__strip' );
		const state = ( element: Element ) =>
			window.getComputedStyle( element ).animationPlayState;

		// Four named logos, then decorative repeats that fill the strip.
		await expect( marquee.getByRole( 'img' ) ).toHaveCount( 4 );
		await expect(
			marquee.getByRole( 'img', { name: 'NY Tech Alliance' } )
		).toBeVisible();
		const repeats = marquee.locator(
			'.ts-marquee__set[aria-hidden="true"][inert]'
		);
		await expect( repeats ).toHaveCount( 3 );
		expect(
			await repeats
				.locator( 'img' )
				.evaluateAll( ( images ) =>
					images.every(
						( image ) => image.getAttribute( 'alt' ) === ''
					)
				)
		).toBe( true );

		// The pause control is a checkbox, so it needs no JavaScript.
		expect( await strip.evaluate( state ) ).toBe( 'running' );
		const pause = marquee.getByRole( 'checkbox', {
			name: 'Pause the moving logos',
		} );
		await pause.check();
		expect( await strip.evaluate( state ) ).toBe( 'paused' );
		await pause.uncheck();
		await page.mouse.move( 0, 0 );
		expect( await strip.evaluate( state ) ).toBe( 'running' );
		await moving.close();

		// Less motion: one still row, no repeats and nothing to pause.
		const still = await browser.newContext( {
			...NO_JS,
			reducedMotion: 'reduce',
		} );
		page = await still.newPage();
		await page.goto( home.link );
		marquee = page.getByRole( 'region', { name: 'E2E partners' } );
		strip = marquee.locator( '.ts-marquee__strip' );
		expect(
			await strip.evaluate(
				( element ) => window.getComputedStyle( element ).animationName
			)
		).toBe( 'none' );
		await expect( marquee.locator( 'img:visible' ) ).toHaveCount( 4 );
		await expect( marquee.getByRole( 'checkbox' ) ).toHaveCount( 0 );
		await still.close();
	} );

	test( 'the hero carousel moves between slides with links', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( MOVING );
		const page = await context.newPage();
		await page.goto( home.link );

		const carousel = page.getByRole( 'region', { name: 'Highlights' } );
		await expect( carousel ).toHaveAttribute(
			'aria-roledescription',
			'carousel'
		);
		const track = carousel.locator( '.ts-carousel__track' );
		const slides = track.locator( '> .wp-block-cover' );
		await expect( slides ).toHaveCount( 2 );
		await expect( slides.nth( 1 ) ).toHaveAttribute( 'role', 'group' );
		await expect( slides.nth( 1 ) ).toHaveAttribute(
			'aria-label',
			'2 of 2'
		);

		// One dot per slide, each a link to its slide's id.
		const dots = carousel
			.getByRole( 'navigation', { name: 'Slides' } )
			.getByRole( 'link' );
		await expect( dots ).toHaveText( [ 'Slide 1', 'Slide 2' ] );
		const second = ( await slides.nth( 1 ).getAttribute( 'id' ) ) ?? '';
		expect( second ).not.toBe( '' );
		await expect( dots.nth( 1 ) ).toHaveAttribute( 'href', `#${ second }` );

		const dotWidth = ( dot: Element ) =>
			window.getComputedStyle( dot, '::before' ).width;
		expect( await dots.first().evaluate( dotWidth ) ).toBe( '28px' );
		expect( await track.evaluate( ( el ) => el.scrollLeft ) ).toBe( 0 );

		// The second dot brings the second slide into view and takes the mark.
		await dots.nth( 1 ).click();
		await expect( page ).toHaveURL( new RegExp( `#${ second }$` ) );
		await expect
			.poll( () =>
				track.evaluate( ( el ) => el.scrollLeft >= el.clientWidth - 1 )
			)
			.toBe( true );
		await expect
			.poll( () => dots.nth( 1 ).evaluate( dotWidth ) )
			.toBe( '28px' );
		await expect
			.poll( () => dots.first().evaluate( dotWidth ) )
			.toBe( '8px' );

		// A single slide is just the slide: no dots, no carousel roles.
		const single = page.locator( '.e2e-single' );
		await expect( single.locator( '.wp-block-cover' ) ).toHaveCount( 1 );
		await expect( single.getByRole( 'navigation' ) ).toHaveCount( 0 );
		await expect( single ).not.toHaveAttribute( 'role' );

		await context.close();
	} );

	test( 'the Home page pattern uses the stats and the logo marquee', async ( {
		browser,
		requestUtils,
	} ) => {
		const front = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Home Pattern',
				status: 'publish',
				content: '<!-- wp:pattern {"slug":"tekseries/page-home"} /-->',
			},
		} );
		extras.push( front.id );

		const context = await browser.newContext( NO_JS );
		const page = await context.newPage();
		await page.goto( front.link );
		await expect(
			page.locator( '.wp-block-tekseries-stat .screen-reader-text' )
		).toHaveText( [ '312+', '675+', '25+', '100’s' ] );
		await expect(
			page
				.getByRole( 'region', {
					name: 'Organisations TekSeries has worked with',
				} )
				.getByRole( 'img' )
		).toHaveCount( 4 );
		await context.close();
	} );

	test( 'loads no scripts for them and opens cleanly in the editor', async ( {
		admin,
		browser,
		editor,
		page,
	} ) => {
		const context = await browser.newContext( {
			storageState: { cookies: [], origins: [] },
		} );
		const visitor = await context.newPage();
		const scripts: string[] = [];
		visitor.on( 'request', ( request ) => scripts.push( request.url() ) );
		await visitor.goto( home.link );
		expect(
			scripts.filter( ( url ) =>
				/react|jquery|tekseries-blocks\/build\/.*\.js/i.test( url )
			)
		).toEqual( [] );
		await context.close();

		await admin.editPost( home.id );
		await expect(
			editor.canvas.locator( '.wp-block-tekseries-logo-marquee' )
		).toBeVisible();
		await expect(
			editor.canvas.locator( '.wp-block-tekseries-stat' ).first()
		).toHaveText( '312+' );
		expect( await invalidBlocks( page ) ).toEqual( [] );
	} );
} );
