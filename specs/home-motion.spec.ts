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
// carousel. All three are complete on the server and need no JavaScript; the
// carousel's script only adds to it.
test.describe( 'home motion blocks', () => {
	let home: Linked;
	// A slide: the first Cover of the theme's Home hero.
	let slide = '';
	const extras: number[] = [];

	test.beforeAll( async ( { requestUtils } ) => {
		// Slides and logos come from the theme's own Home patterns.
		const patterns = await requestUtils.rest< Pattern[] >( {
			path: '/wp/v2/block-patterns/patterns',
		} );
		const content = ( name: string ) =>
			patterns.find( ( pattern ) => pattern.name === name )?.content ??
			'';
		slide =
			content( 'tekseries/home-hero' ).match(
				/<!-- wp:cover[\s\S]*?<!-- \/wp:cover -->/
			)?.[ 0 ] ?? '';
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
					`<!-- wp:tekseries/hero-carousel {"autoplay":true,"ariaLabel":"E2E moving"} -->${ slide }${ slide }<!-- /wp:tekseries/hero-carousel -->`,
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
		// Only the first slide's photo is fetched ahead; the others follow.
		await expect( slides.nth( 0 ).locator( 'img' ) ).not.toHaveAttribute(
			'fetchpriority',
			'low'
		);
		await expect( slides.nth( 1 ).locator( 'img' ) ).toHaveAttribute(
			'fetchpriority',
			'low'
		);
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

	test( 'with its script the dots follow the slides, which can change by themselves', async ( {
		browser,
	} ) => {
		const scrolled = ( track: Element ) => Math.round( track.scrollLeft );
		const open = async ( reducedMotion: 'reduce' | 'no-preference' ) => {
			const context = await browser.newContext( {
				storageState: { cookies: [], origins: [] },
				reducedMotion,
			} );
			const page = await context.newPage();
			await page.goto( home.link );
			// Slides move at once, so a check right after is a fair one.
			await page.addStyleTag( {
				content: '.ts-carousel__track{scroll-behavior:auto!important}',
			} );
			return page;
		};

		let page = await open( 'no-preference' );
		const plain = page.getByRole( 'region', { name: 'Highlights' } );
		let track = plain.locator( '.ts-carousel__track' );
		let dots = plain
			.getByRole( 'navigation', { name: 'Slides' } )
			.getByRole( 'link' );
		await expect( dots.first() ).toHaveAttribute( 'aria-current', 'true' );
		// Without the editor's switch there is nothing to pause.
		await expect( plain.getByRole( 'button' ) ).toHaveCount( 0 );

		// A dot moves the slides where they are: no jump, no new address.
		await dots.nth( 1 ).scrollIntoViewIfNeeded();
		const top = await page.evaluate( () => window.scrollY );
		await dots.nth( 1 ).click();
		await expect( dots.nth( 1 ) ).toHaveAttribute( 'aria-current', 'true' );
		await expect( dots.first() ).toHaveAttribute( 'aria-current', 'false' );
		expect( page.url() ).toBe( home.link );
		expect( await page.evaluate( () => window.scrollY ) ).toBe( top );
		// A swipe back, and the first dot takes the mark again.
		await track.evaluate( ( element ) => element.scrollTo( { left: 0 } ) );
		await expect( dots.first() ).toHaveAttribute( 'aria-current', 'true' );

		const moving = page.getByRole( 'region', { name: 'E2E moving' } );
		track = moving.locator( '.ts-carousel__track' );
		dots = moving
			.getByRole( 'navigation', { name: 'Slides' } )
			.getByRole( 'link' );
		const pause = moving.getByRole( 'button', {
			name: 'Pause the slides',
		} );
		const play = moving.getByRole( 'button', { name: 'Play the slides' } );
		// Leaves the slides to themselves: off the button, pointer away.
		const letGo = async () => {
			await moving.getByRole( 'button' ).blur();
			await page.mouse.move( 0, 0 );
		};
		const width = await track.evaluate(
			( element ) => element.clientWidth
		);

		// The test's clock can only take over once the page's scripts have
		// started (WordPress reads the real one), so the slides wait paused.
		await pause.click();
		await page.clock.install();
		await play.click();
		await letGo();

		// With the switch on, the next slide comes after seven seconds.
		await page.clock.fastForward( 6000 );
		expect( await track.evaluate( scrolled ) ).toBe( 0 );
		await page.clock.fastForward( 1000 );
		await expect( dots.nth( 1 ) ).toHaveAttribute( 'aria-current', 'true' );
		expect( await track.evaluate( scrolled ) ).toBe( width );

		// Not under the pointer.
		await moving.hover();
		await page.clock.fastForward( 7000 );
		expect( await track.evaluate( scrolled ) ).toBe( width );
		// Not while paused, and the button says what it will do next.
		await pause.click();
		await expect( play ).toBeVisible();
		await letGo();
		await page.clock.fastForward( 15000 );
		expect( await track.evaluate( scrolled ) ).toBe( width );
		// Playing again, the last slide gives way to the first.
		await play.click();
		await letGo();
		await page.clock.fastForward( 7000 );
		await expect( dots.first() ).toHaveAttribute( 'aria-current', 'true' );
		expect( await track.evaluate( scrolled ) ).toBe( 0 );
		await page.context().close();

		// Less motion: the dots still follow, and nothing is there to pause
		// because nothing moves by itself.
		page = await open( 'reduce' );
		const still = page.getByRole( 'region', { name: 'E2E moving' } );
		await expect(
			still
				.getByRole( 'navigation', { name: 'Slides' } )
				.getByRole( 'link' )
				.first()
		).toHaveAttribute( 'aria-current', 'true' );
		await expect( still.getByRole( 'button' ) ).toHaveCount( 0 );
		await page.context().close();
	} );

	test( 'an editor adds, removes and sets the slides in the Site Editor', async ( {
		admin,
		browser,
		editor,
		page,
		requestUtils,
	} ) => {
		const made = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Slides',
				status: 'publish',
				content: `<!-- wp:tekseries/hero-carousel -->${ slide }<!-- /wp:tekseries/hero-carousel -->`,
			},
		} );
		extras.push( made.id );
		// Appearance > Editor > Pages: the page inside its template.
		await admin.visitSiteEditor( {
			postId: made.id,
			postType: 'page',
			canvas: 'edit',
		} );

		const carousel = editor.canvas.locator(
			'.wp-block-tekseries-hero-carousel'
		);
		const slides = carousel.locator( '> .wp-block-cover' );
		await expect( slides ).toHaveCount( 1 );

		// A slide is a Cover and nothing else.
		const id = ( await carousel.getAttribute( 'data-block' ) ) ?? '';
		expect(
			await page.evaluate( ( root ) => {
				const { wp } = window as unknown as {
					wp: {
						data: {
							select: ( store: string ) => {
								canInsertBlockType: (
									name: string,
									parent: string
								) => boolean;
							};
						};
					};
				};
				return [ 'core/cover', 'core/paragraph' ].map( ( name ) =>
					wp.data
						.select( 'core/block-editor' )
						.canInsertBlockType( name, root )
				);
			}, id )
		).toEqual( [ true, false ] );

		// Duplicating a slide adds one with the same layout.
		await editor.selectBlocks( slides.first() );
		await editor.clickBlockOptionsMenuItem( 'Duplicate' );
		await editor.selectBlocks( slides.first() );
		await editor.clickBlockOptionsMenuItem( 'Duplicate' );
		await expect( slides ).toHaveCount( 3 );

		// The block's own setting makes the slides change by themselves.
		await editor.selectBlocks( carousel );
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'checkbox', { name: 'Change slides automatically' } )
			.check();
		await editor.saveSiteEditorEntities( {
			isOnlyCurrentEntityDirty: true,
		} );

		const visit = async () => {
			const context = await browser.newContext( {
				storageState: { cookies: [], origins: [] },
				reducedMotion: 'no-preference',
			} );
			const visitor = await context.newPage();
			await visitor.goto( made.link );
			const hero = visitor.getByRole( 'region', { name: 'Highlights' } );
			const found = {
				slides: await hero.getByRole( 'group' ).count(),
				dots: await hero
					.getByRole( 'navigation', { name: 'Slides' } )
					.getByRole( 'link' )
					.count(),
				pause: await hero
					.getByRole( 'button', { name: 'Pause the slides' } )
					.count(),
			};
			await context.close();
			return found;
		};
		await expect.poll( visit ).toEqual( { slides: 3, dots: 3, pause: 1 } );

		// Deleting a slide takes its dot with it.
		await editor.selectBlocks( slides.last() );
		await editor.clickBlockOptionsMenuItem( 'Delete' );
		await expect( slides ).toHaveCount( 2 );
		await editor.saveSiteEditorEntities( {
			isOnlyCurrentEntityDirty: true,
		} );
		// (Asked until it is so: the save notice of the first save is still up.)
		await expect.poll( visit ).toEqual( { slides: 2, dots: 2, pause: 1 } );
		expect( await invalidBlocks( page ) ).toEqual( [] );
	} );

	test( 'the Home page pattern uses the carousel, the stats and the logo marquee', async ( {
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
		// Two slides; only the first holds a top-level heading.
		const hero = page.getByRole( 'region', { name: 'Highlights' } );
		await expect( hero.getByRole( 'group' ) ).toHaveCount( 2 );
		await expect( hero.getByRole( 'heading', { level: 1 } ) ).toHaveText(
			'Expanding Opportunity, Empowering Our Future'
		);
		await expect( hero.getByRole( 'heading', { level: 2 } ) ).toHaveText(
			'One Youth Career At A Time'
		);
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

	test( 'loads only the carousel script for them and opens cleanly in the editor', async ( {
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
			scripts
				.filter( ( url ) =>
					/react|jquery|tekseries-blocks\/build\/.*\.js/i.test( url )
				)
				.map( ( url ) => url.replace( /^.*\/build\/|\?.*$/g, '' ) )
		).toEqual( [ 'hero-carousel/view.js' ] );
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
