import { writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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
// The smallest file WordPress accepts as a video: an MP4 header and nothing
// else. It never plays, so the video tests watch what the script asks of it.
const CLIP = path.join( os.tmpdir(), 'e2e-slide-clip.mp4' );
const MP4_HEADER =
	'000000206674797069736f6d0000020069736f6d69736f32617663316d70343100000008667265650000';
// A slide with a video for its background, as the Cover block saves it.
const videoSlide = ( url: string, text: string ) =>
	`<!-- wp:cover {"url":"${ url }","dimRatio":50,"backgroundType":"video","isDark":true} -->` +
	`<div class="wp-block-cover"><video class="wp-block-cover__video-background intrinsic-ignore" autoplay muted loop playsinline src="${ url }" data-object-fit="cover"></video>` +
	'<span aria-hidden="true" class="wp-block-cover__background has-background-dim"></span>' +
	`<div class="wp-block-cover__inner-container"><!-- wp:paragraph --><p>${ text }</p><!-- /wp:paragraph --></div></div><!-- /wp:cover -->`;

// The Home blocks that move: the stat count-up, the logo marquee and the hero
// carousel. All three are complete on the server and need no JavaScript; the
// carousel's script and the reveal script (specs/reveal.spec.ts) only add to it.
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
					`<!-- wp:tekseries/hero-carousel {"autoplay":true,"interval":4,"pauseOnHover":false,"dotSpacing":"close","ariaLabel":"E2E quick"} -->${ slide }${ slide }<!-- /wp:tekseries/hero-carousel -->`,
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

	test( 'the first slide’s text rises in when the page opens', async ( {
		browser,
	} ) => {
		const rise = ( items: Element[] ) =>
			items.map( ( item ) => {
				const style = window.getComputedStyle( item );
				return `${ style.animationName } ${ parseFloat(
					style.animationDelay
				).toFixed( 2 ) }`;
			} );
		// CSS alone, so it needs no script.
		const open = async ( reducedMotion: 'reduce' | 'no-preference' ) => {
			const context = await browser.newContext( {
				...NO_JS,
				reducedMotion,
			} );
			const page = await context.newPage();
			await page.goto( home.link );
			return page
				.getByRole( 'region', { name: 'Highlights' } )
				.locator( '.ts-carousel__track > .wp-block-cover' );
		};

		// Whatever sits beside the main heading, one item after another.
		let slides = await open( 'no-preference' );
		expect(
			await slides.first().locator( ':has(> h1) > *' ).evaluateAll( rise )
		).toEqual( [
			'ts-carousel-rise 0.15',
			'ts-carousel-rise 0.27',
			'ts-carousel-rise 0.39',
			'ts-carousel-rise 0.51',
			'ts-carousel-rise 0.63',
		] );
		// The other slides are out of sight then, and stay as they are.
		expect(
			await slides
				.nth( 1 )
				.locator( ':has(> h1) > *' )
				.evaluateAll( rise )
		).toEqual( Array( 5 ).fill( 'none 0.00' ) );

		// An item the keyboard reaches is there at once, and it does not rise
		// in again once the focus has moved on.
		const item = slides.first().locator( ':has(> h1) > :has(a)' ).first();
		const shown = ( element: Element ) => {
			const style = window.getComputedStyle( element );
			return [ style.opacity, style.translate ];
		};
		const playing = () =>
			item.evaluate( ( element ) => element.getAnimations().length );
		await item.locator( 'a' ).first().focus();
		expect( await item.evaluate( shown ) ).toEqual( [ '1', 'none' ] );
		await expect.poll( playing ).toBe( 0 );
		await item
			.locator( 'a' )
			.first()
			.evaluate( ( link: HTMLElement ) => link.blur() );
		expect( await playing() ).toBe( 0 );
		expect( await item.evaluate( shown ) ).toEqual( [ '1', 'none' ] );
		await slides.page().context().close();

		// A press of the pointer does not bring an item to its place with a
		// jump: the pointer would be let go beside the link, with no click.
		slides = await open( 'no-preference' );
		const page = slides.page();
		// Slowed to a crawl, so the items are on their way all through.
		// (Put in as an element: this page runs without JavaScript, where
		// Playwright's own way of adding a style never returns.)
		await page.evaluate( ( css ) => {
			const style = document.createElement( 'style' );
			style.textContent = css;
			document.head.append( style );
		}, 'html { scroll-behavior: auto !important; } .ts-carousel__track > :first-child :has(> h1) > * { animation-duration: 600s !important; animation-delay: 0s !important; animation-timing-function: linear !important; }' );
		const pressed = slides
			.first()
			.locator( ':has(> h1) > :has(a)' )
			.first();
		const link = pressed.locator( 'a' ).first();
		// (Not Playwright's own scrolling: it waits for the item to stop.)
		await link.evaluate( ( element ) =>
			element.scrollIntoView( { block: 'center' } )
		);
		expect(
			await pressed.evaluate(
				( element ) => element.getAnimations().length
			)
		).toBeGreaterThan( 0 );
		const before = await link.boundingBox();
		await page.mouse.move(
			( before?.x ?? 0 ) + ( before?.width ?? 0 ) / 2,
			( before?.y ?? 0 ) + ( before?.height ?? 0 ) / 2
		);
		await page.mouse.down();
		const held = await link.boundingBox();
		expect(
			Math.abs( ( held?.y ?? 0 ) - ( before?.y ?? 0 ) )
		).toBeLessThan( 2 );
		expect( ( await pressed.evaluate( shown ) )[ 0 ] ).toBe( '1' );
		await page.mouse.up();
		await page.context().close();

		slides = await open( 'reduce' );
		expect(
			await slides.first().locator( ':has(> h1) > *' ).evaluateAll( rise )
		).toEqual( Array( 5 ).fill( 'none 0.00' ) );
		await slides.page().context().close();
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

	// The editor's settings: how long a slide stays, whether the pointer over
	// the slides holds them, and how far apart the dots sit.
	test( 'follows the editor’s seconds, pointer and dot spacing settings', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			storageState: { cookies: [], origins: [] },
			reducedMotion: 'no-preference',
		} );
		const page = await context.newPage();
		await page.goto( home.link );
		await page.addStyleTag( {
			content: '.ts-carousel__track{scroll-behavior:auto!important}',
		} );
		const spacing = ( name: string ) =>
			page.getByRole( 'region', { name } ).evaluate( ( carousel ) => {
				const edge = ( selector: string ) =>
					carousel.querySelector( selector )?.getBoundingClientRect();
				const dots = [
					...carousel.querySelectorAll( '.ts-carousel__dots a' ),
				].map( ( dot ) => dot.getBoundingClientRect() );
				return {
					widths: dots.map( ( dot ) => dot.width ),
					gap:
						( dots[ 1 ]?.left ?? NaN ) -
						( dots[ 0 ]?.right ?? NaN ),
					fromCorner:
						carousel.getBoundingClientRect().right -
						( edge( '.ts-carousel__controls' )?.right ?? NaN ),
					fromPause:
						( dots[ 0 ]?.left ?? NaN ) -
						( edge( '.ts-carousel__pause' )?.right ?? NaN ),
				};
			} );

		// By default every dot is a full tap target, side by side.
		expect( await spacing( 'E2E moving' ) ).toEqual( {
			widths: [ 44, 44 ],
			gap: 0,
			fromCorner: 24,
			fromPause: 0,
		} );
		// Close together: each link is its dot (28px for the slide in view,
		// 8px otherwise), 8px apart, further in from the corner.
		expect( await spacing( 'E2E quick' ) ).toEqual( {
			widths: [ 28, 8 ],
			gap: 8,
			fromCorner: 40,
			fromPause: 8,
		} );

		const quick = page.getByRole( 'region', { name: 'E2E quick' } );
		const track = quick.locator( '.ts-carousel__track' );
		const dots = quick
			.getByRole( 'navigation', { name: 'Slides' } )
			.getByRole( 'link' );
		const scrolled = ( element: Element ) =>
			Math.round( element.scrollLeft );
		await quick.getByRole( 'button', { name: 'Pause the slides' } ).click();
		await page.clock.install();
		await quick.getByRole( 'button', { name: 'Play the slides' } ).click();
		await quick.getByRole( 'button' ).blur();
		// The pointer stays over the slides: here that holds nothing.
		await track.hover();

		// Four seconds on a slide, not the default seven.
		await page.clock.fastForward( 3000 );
		expect( await track.evaluate( scrolled ) ).toBe( 0 );
		await page.clock.fastForward( 1000 );
		await expect( dots.nth( 1 ) ).toHaveAttribute( 'aria-current', 'true' );
		expect( await track.evaluate( scrolled ) ).toBeGreaterThan( 0 );
		await context.close();
	} );

	// Slides with a video for their background: only the slide in view plays
	// its own, later ones don't load theirs up front, and the pause button is
	// there even when the slides don't change by themselves.
	test( 'plays only the video of the slide in view, with a pause button', async ( {
		browser,
		requestUtils,
	} ) => {
		writeFileSync( CLIP, Buffer.from( MP4_HEADER, 'hex' ) );
		const clip = await requestUtils.uploadMedia( CLIP );
		const url = clip.source_url;
		const films = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Video Slides',
				status: 'publish',
				content: [
					`<!-- wp:tekseries/hero-carousel {"ariaLabel":"E2E films"} -->${ videoSlide(
						url,
						'Film one'
					) }${ videoSlide(
						url,
						'Film two'
					) }<!-- /wp:tekseries/hero-carousel -->`,
					`<!-- wp:tekseries/hero-carousel {"className":"e2e-one-film"} -->${ videoSlide(
						url,
						'Only film'
					) }<!-- /wp:tekseries/hero-carousel -->`,
					`<!-- wp:video {"className":"is-style-frame"} --><figure class="wp-block-video is-style-frame"><video controls src="${ url }"></video></figure><!-- /wp:video -->`,
				].join( '' ),
			},
		} );
		extras.push( films.id );

		// Without JavaScript: the first slide's video starts by itself, the
		// second neither loads nor starts, and the button stays hidden.
		let context = await browser.newContext( MOVING );
		let page = await context.newPage();
		await page.goto( films.link );
		let videos = page
			.getByRole( 'region', { name: 'E2E films' } )
			.locator( 'video' );
		await expect( videos ).toHaveCount( 2 );
		await expect( videos.first() ).toHaveAttribute( 'autoplay', '' );
		await expect( videos.first() ).not.toHaveAttribute( 'preload' );
		await expect( videos.last() ).toHaveAttribute( 'preload', 'none' );
		await expect( videos.last() ).not.toHaveAttribute( 'autoplay' );
		await expect(
			page.locator( '.ts-carousel__pause' ).first()
		).toBeHidden();
		// "Photo frame (4:3)": a Video block cropped like a photo.
		const framed = page.locator( '.wp-block-video.is-style-frame video' );
		await expect( framed ).toHaveCSS( 'aspect-ratio', '4 / 3' );
		await expect( framed ).toHaveCSS( 'object-fit', 'cover' );
		await context.close();

		// With JavaScript: what the script last asked of each video.
		const open = async ( reducedMotion: 'reduce' | 'no-preference' ) => {
			context = await browser.newContext( {
				storageState: { cookies: [], origins: [] },
				reducedMotion,
			} );
			page = await context.newPage();
			await page.addInitScript( () => {
				const media = HTMLMediaElement.prototype;
				const { play, pause } = media;
				media.play = function ( this: HTMLMediaElement ) {
					this.dataset.asked = 'play';
					return play.call( this );
				};
				media.pause = function ( this: HTMLMediaElement ) {
					this.dataset.asked = 'pause';
					pause.call( this );
				};
			} );
			await page.goto( films.link );
			await page.addStyleTag( {
				content: '.ts-carousel__track{scroll-behavior:auto!important}',
			} );
		};
		const asked = () =>
			videos.evaluateAll( ( all ) =>
				all.map( ( video ) => ( video as HTMLElement ).dataset.asked )
			);

		await open( 'no-preference' );
		const carousel = page.getByRole( 'region', { name: 'E2E films' } );
		videos = carousel.locator( 'video' );
		const pause = carousel.getByRole( 'button', {
			name: 'Pause the slides',
		} );
		// The slides here don't change by themselves; the videos move, so the
		// button is offered all the same.
		await expect( pause ).toBeVisible();
		await expect.poll( asked ).toEqual( [ 'play', 'pause' ] );
		// The second slide comes into view: its video takes over.
		await carousel
			.getByRole( 'navigation', { name: 'Slides' } )
			.getByRole( 'link' )
			.nth( 1 )
			.click();
		await expect.poll( asked ).toEqual( [ 'pause', 'play' ] );
		await pause.click();
		await expect.poll( asked ).toEqual( [ 'pause', 'pause' ] );
		await carousel
			.getByRole( 'button', { name: 'Play the slides' } )
			.click();
		await expect.poll( asked ).toEqual( [ 'pause', 'play' ] );
		// One slide alone has no dots, and still a way to stop its video.
		const single = page.locator( '.e2e-one-film' );
		await expect( single.getByRole( 'navigation' ) ).toHaveCount( 0 );
		await single
			.getByRole( 'button', { name: 'Pause the slides' } )
			.click();
		await expect( single.locator( 'video' ) ).toHaveAttribute(
			'data-asked',
			'pause'
		);
		await context.close();

		// Less motion: every video is stopped and there is nothing to pause.
		await open( 'reduce' );
		videos = page
			.getByRole( 'region', { name: 'E2E films' } )
			.locator( 'video' );
		await expect.poll( asked ).toEqual( [ 'pause', 'pause' ] );
		await expect(
			page.locator( '.ts-carousel__pause' ).first()
		).toBeHidden();
		await context.close();
		await requestUtils.deleteMedia( clip.id );
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

		// "Add slide" brings a whole slide: a heading to type over, two
		// buttons and the three labels.
		await carousel.getByRole( 'button', { name: 'Add slide' } ).click();
		await expect( slides ).toHaveCount( 2 );
		const added = slides.nth( 1 );
		await expect( added.locator( 'h2' ) ).toHaveCount( 1 );
		await expect( added.locator( '.wp-block-button' ) ).toHaveCount( 2 );
		await expect( added ).toContainText( 'Share' );
		await expect( added ).toContainText( 'Solve' );

		// Duplicating a slide adds one with the same layout.
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
			'Equipping underserved youth with Digital, AI, and Creative Economy Skills'
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
		// The section headings and the three pillar cards rise in when a
		// visitor scrolls to them (specs/reveal.spec.ts).
		await expect( page.locator( 'h2.ts-reveal' ) ).toHaveText( [
			'Get Involved, Help Grow Our Impact',
			'Who We Are',
			'What We Do',
			'Team',
		] );
		await expect( page.locator( 'article.ts-reveal' ) ).toHaveCount( 3 );
		// So do the tiles, the team cards, the Mission card and its photo,
		// the case study and the quote: the owner marked them in the editor.
		for ( const [ marked, count ] of [
			[ '.is-style-tile.ts-reveal', 10 ],
			[ '.is-style-tile-glass.ts-reveal', 6 ],
			[ '.is-style-tile-frost.ts-reveal', 4 ],
			[ '#team .is-style-card.ts-reveal', 6 ],
			[
				'#about .is-style-card-plum.ts-reveal, #about figure.ts-reveal, div.is-style-card-saffron.ts-reveal, p.is-style-pull.ts-reveal',
				4,
			],
		] as const ) {
			await expect( page.locator( marked ) ).toHaveCount( count );
		}
		// The Mission card ends with its text: under the last paragraph
		// there is its padding and nothing more.
		const [ under, padding ] = await page
			.locator( '#about .is-style-card-plum.ts-fit' )
			.evaluate( ( card ) => [
				card.getBoundingClientRect().bottom -
					( card.lastElementChild?.getBoundingClientRect().bottom ??
						0 ),
				parseFloat( getComputedStyle( card ).paddingBottom ),
			] );
		expect( under ).toBeCloseTo( padding ?? NaN, 0 );
		await context.close();
	} );

	test( 'loads only the carousel and reveal scripts for them and opens cleanly in the editor', async ( {
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
				.sort()
		).toEqual( [ 'hero-carousel/view.js', 'reveal/view.js' ] );
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
