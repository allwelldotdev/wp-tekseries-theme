import { writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { crc32, deflateSync } from 'node:zlib';
import AxeBuilder from '@axe-core/playwright';
import type { Browser, Page } from '@playwright/test';
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { textContrast } from './utils/contrast';
import { setUpJobPages } from './utils/wpjm';

type Linked = { id: number; link: string };
type Uploaded = { id: number; source_url: string };
type Pattern = { name: string; content: string };
type Size = { width: number; height: number };

// WCAG 2.2, levels A and AA.
const TAGS = [ 'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa' ];
const DESKTOP = { width: 1280, height: 900 };
const TABLET = { width: 834, height: 1112 };
const PHONE = { width: 390, height: 844 };

// Every kind of public page, as a visitor gets it.
const PAGES = [
	'front page',
	'Home page pattern',
	'Contact page pattern',
	'events archive',
	'events archive, last page',
	'event type archive',
	'event',
	'news post',
	'gallery',
	'gallery with nothing to show',
	'legal page',
	'job listings',
	'job search with no results',
	'job',
	'job dashboard',
	'job submission',
	'search results',
	'search with no results',
	'not found',
];

// Each tone with the photo that leaves its date the least contrast.
const TONES: [ tone: string, photo: 'white' | 'black' ][] = [
	[ 'plum', 'white' ],
	[ 'ink', 'white' ],
	[ 'saffron', 'black' ],
	[ 'lilac', 'black' ],
];

const PHOTO = path.join(
	__dirname,
	'../wp-content/themes/tekseries/assets/images/home/about.jpg'
);

// A square of one grey as a PNG file: the brightest or the darkest photo an
// editor could put under text.
const flatPng = ( name: string, shade: number, size = 64 ) => {
	const chunk = ( type: string, data: Buffer ) => {
		const body = Buffer.concat( [ Buffer.from( type ), data ] );
		const length = Buffer.alloc( 4 );
		length.writeUInt32BE( data.length );
		const check = Buffer.alloc( 4 );
		check.writeUInt32BE( crc32( body ) );
		return Buffer.concat( [ length, body, check ] );
	};
	const header = Buffer.alloc( 13 );
	header.writeUInt32BE( size, 0 );
	header.writeUInt32BE( size, 4 );
	header[ 8 ] = 8; // Bits per pixel; the colour type stays 0, greyscale.
	// Each row: a filter byte (0), then its pixels.
	const rows = Buffer.alloc( size * ( size + 1 ), shade );
	for ( let y = 0; y < size; y++ ) {
		rows[ y * ( size + 1 ) ] = 0;
	}
	const file = path.join( os.tmpdir(), name );
	writeFileSync(
		file,
		Buffer.concat( [
			Buffer.from( '89504e470d0a1a0a', 'hex' ),
			chunk( 'IHDR', header ),
			chunk( 'IDAT', deflateSync( rows ) ),
			chunk( 'IEND', Buffer.alloc( 0 ) ),
		] )
	);
	return file;
};

const visitor = async ( browser: Browser, viewport: Size, motion = false ) => {
	const context = await browser.newContext( {
		storageState: { cookies: [], origins: [] },
		viewport,
		reducedMotion: motion ? 'no-preference' : 'reduce',
	} );
	// The Contact page's map is Google's: the scan is of our frame around
	// it, and must not hang on their servers.
	await context.route( 'https://www.google.com/maps/**', ( route ) =>
		route.fulfill( {
			contentType: 'text/html',
			body: '<!doctype html><html lang="en"><head><title>Map</title></head><body><main><h1>Map</h1></main></body></html>',
		} )
	);
	return context;
};

// What axe finds wrong on the page as it is now, one line per rule.
const violations = async ( page: Page, exclude: string[] = [] ) => {
	const axe = exclude.reduce(
		( builder, selector ) => builder.exclude( selector ),
		new AxeBuilder( { page } ).withTags( TAGS )
	);
	return ( await axe.analyze() ).violations.map(
		( { id, nodes } ) =>
			`${ id }: ${ nodes
				.map( ( node ) => node.target.join( ' ' ) )
				.join( ', ' ) }`
	);
};

// An automated check finds only part of what makes a page accessible: it reads
// names, roles, structure and colours. Keyboard flows have their own specs.
test.describe( 'accessibility', () => {
	const made: [ path: string, id: number ][] = [];
	const media: number[] = [];
	const urls = new Map< string, string >();

	test.beforeAll( async ( { requestUtils, browser } ) => {
		const create = async (
			name: string,
			route: string,
			data: Record< string, unknown >
		) => {
			const item = await requestUtils.rest< Linked >( {
				method: 'POST',
				path: route,
				data: { status: 'publish', ...data },
			} );
			made.push( [ route, item.id ] );
			urls.set( name, item.link );
			return item;
		};
		const upload = async (
			file: string,
			data: Record< string, unknown > = {}
		) => {
			const { id } = await requestUtils.uploadMedia( file );
			media.push( id );
			return requestUtils.rest< Uploaded >( {
				method: 'POST',
				path: `/wp/v2/media/${ id }`,
				data,
			} );
		};
		const pattern = ( slug: string ) =>
			`<!-- wp:pattern {"slug":"tekseries/${ slug }"} /-->`;

		const photos = {
			white: await upload( flatPng( 'e2e-white.png', 255 ) ),
			black: await upload( flatPng( 'e2e-black.png', 0 ) ),
		};

		// Events and a post over those photos, one per tone.
		const [ existing ] = await requestUtils.rest< Linked[] >( {
			path: '/wp/v2/event_type',
			params: { slug: 'webinar' },
		} );
		const webinar =
			existing ??
			( await requestUtils.rest< Linked >( {
				method: 'POST',
				path: '/wp/v2/event_type',
				data: { name: 'Webinar', slug: 'webinar' },
			} ) );
		urls.set( 'event type archive', webinar.link );
		for ( const [ index, [ tone, photo ] ] of TONES.entries() ) {
			await create( 'event', '/wp/v2/event', {
				title: `E2E A11y ${ tone }`,
				content: 'An event.',
				featured_media: photos[ photo ].id,
				event_type: [ webinar.id ],
				meta: { tekseries_tone: tone, tekseries_icon: 'school' },
				acf: {
					// Listings follow the event date: these lead page one.
					event_date: `2099122${ index }`,
					time_label: '11:00 AM WAT',
					venue: 'Online (Zoom)',
					cta_link: {
						title: '',
						url: 'https://example.com/',
						target: '',
					},
					cta_name: 'Register',
				},
			} );
		}
		// Three older events open a second page of the listing: the latest
		// card and five in the grid fill the first.
		for ( const n of [ 1, 2, 3 ] ) {
			await create( `extra event ${ n }`, '/wp/v2/event', {
				title: `E2E A11y Extra ${ n }`,
				content: 'An event.',
				acf: {
					event_date: `2000010${ n }`,
					time_label: '',
					venue: '',
					cta_link: { title: '', url: '', target: '' },
					cta_name: '',
				},
			} );
		}
		await create( 'news post', '/wp/v2/posts', {
			title: 'E2E A11y Post',
			content: 'A post.',
			featured_media: photos.white.id,
		} );

		// Pages built from the theme's patterns, and the hero over a white photo.
		await create( 'Home page pattern', '/wp/v2/pages', {
			title: 'E2E A11y Home',
			content: pattern( 'page-home' ),
		} );
		await create( 'Contact page pattern', '/wp/v2/pages', {
			title: 'E2E A11y Contact',
			content: pattern( 'page-contact' ),
		} );
		const patterns = await requestUtils.rest< Pattern[] >( {
			path: '/wp/v2/block-patterns/patterns',
		} );
		const hero =
			patterns.find( ( { name } ) => name === 'tekseries/home-hero' )
				?.content ?? '';
		await create( 'hero over a white photo', '/wp/v2/pages', {
			title: 'E2E A11y Hero',
			template: 'page-no-title',
			content: hero.replace(
				/https?:[^"]+\/images\/home\/hero[^"]*\.jpg/g,
				photos.white.source_url
			),
		} );
		// The same hero with its dots 8px apart instead of a tap target each.
		await create( 'hero with close dots', '/wp/v2/pages', {
			title: 'E2E A11y Close Dots',
			template: 'page-no-title',
			content: hero.replace(
				'<!-- wp:tekseries/hero-carousel {',
				'<!-- wp:tekseries/hero-carousel {"dotSpacing":"close",'
			),
		} );
		await create( 'legal page', '/wp/v2/pages', {
			title: 'E2E A11y Legal',
			template: 'page-legal',
			content:
				'<!-- wp:heading {"anchor":"purpose"} --><h2 class="wp-block-heading" id="purpose">Purpose</h2><!-- /wp:heading -->' +
				'<!-- wp:paragraph --><p>Why this page exists.</p><!-- /wp:paragraph -->',
		} );

		// A gallery with two photos in an album.
		const album = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/media_album',
			data: { name: 'E2E A11y Camp', meta: { tekseries_year: 2025 } },
		} );
		made.push( [ '/wp/v2/media_album', album.id ] );
		for ( const caption of [ 'E2E photo one', 'E2E photo two' ] ) {
			await upload( PHOTO, { media_album: [ album.id ], caption } );
		}
		const gallery = await create( 'gallery', '/wp/v2/pages', {
			title: 'E2E A11y Gallery',
			content: pattern( 'page-gallery' ),
		} );
		urls.set(
			'gallery with nothing to show',
			`${ gallery.link }?media_type=video`
		);

		// Contexts opened here are logged in as the admin.
		const admin = await browser.newPage();
		const jobs = await setUpJobPages( requestUtils, admin );
		await admin.close();
		await create( 'job', '/wp/v2/job-listings', {
			title: 'E2E A11y Job',
			// Imported descriptions carry images with no alt text.
			content: `<p>Build things.</p><img src="${ photos.white.source_url }">`,
			meta: {
				_company_name: 'Acme Robotics',
				_job_location: 'Lagos',
				_application: 'https://example.com/apply',
			},
		} );
		urls.set( 'job listings', jobs.jobs.link );
		urls.set(
			'job search with no results',
			`${ jobs.jobs.link }?search_keywords=zzzzqqqq`
		);
		urls.set( 'job dashboard', jobs.dashboard.link );
		urls.set( 'job submission', jobs.submit.link );

		urls.set( 'front page', '/' );
		urls.set( 'events archive', '/events/' );
		urls.set( 'events archive, last page', '/events/?query-2-page=2' );
		urls.set( 'search results', '/?s=E2E+A11y' );
		urls.set( 'search with no results', '/?s=zzzzqqqq' );
		urls.set( 'not found', '/?p=999999999' );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		for ( const [ route, id ] of made ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `${ route }/${ id }`,
				params: { force: true },
			} );
		}
		for ( const id of media ) {
			await requestUtils.deleteMedia( id );
		}
	} );

	for ( const name of PAGES ) {
		test( `${ name }: no violations on a desktop or a phone`, async ( {
			browser,
		} ) => {
			for ( const viewport of [ DESKTOP, PHONE ] ) {
				const context = await visitor( browser, viewport );
				const page = await context.newPage();
				await page.goto( urls.get( name ) ?? '' );
				expect(
					await violations( page ),
					`${ name } at ${ viewport.width }px`
				).toEqual( [] );
				await context.close();
			}
		} );
	}

	// States only a script or a click reaches. The hero is checked with its
	// dots a tap target each and 8px apart: with two slides, close dots still
	// keep the guideline's smallest spacing (three or more would not).
	for ( const hero of [ 'Home page pattern', 'hero with close dots' ] ) {
		test( `the Home hero on its second slide, paused (${ hero })`, async ( {
			browser,
		} ) => {
			for ( const viewport of [ DESKTOP, PHONE ] ) {
				const context = await visitor( browser, viewport, true );
				const page = await context.newPage();
				await page.goto( urls.get( hero ) ?? '' );
				const dots = page
					.getByRole( 'navigation', { name: 'Slides' } )
					.getByRole( 'link' );
				await dots.nth( 1 ).click();
				await expect( dots.nth( 1 ) ).toHaveAttribute(
					'aria-current',
					'true'
				);
				await page
					.getByRole( 'button', { name: 'Pause the slides' } )
					.click();
				await expect(
					page.getByRole( 'button', { name: 'Play the slides' } )
				).toBeVisible();
				expect( await violations( page ) ).toEqual( [] );
				await context.close();
			}
		} );
	}

	test( 'the header menu open on a tablet and a phone', async ( {
		browser,
	} ) => {
		for ( const viewport of [ TABLET, PHONE ] ) {
			const context = await visitor( browser, viewport );
			const page = await context.newPage();
			await page.goto( '/' );
			await page.getByRole( 'button', { name: 'Open menu' } ).click();
			await expect(
				page.getByRole( 'button', { name: 'Close menu' } )
			).toBeVisible();
			expect( await violations( page ) ).toEqual( [] );
			await context.close();
		}
	} );

	test( 'the gallery viewer open', async ( { browser } ) => {
		for ( const viewport of [ DESKTOP, PHONE ] ) {
			const context = await visitor( browser, viewport );
			const page = await context.newPage();
			await page.goto( urls.get( 'gallery' ) ?? '' );
			await page.locator( '.ts-media__tile' ).first().click();
			await expect(
				page.getByRole( 'dialog', { name: 'Media viewer' } )
			).toBeVisible();
			expect( await violations( page ) ).toEqual( [] );
			await context.close();
		}
	} );

	test( 'the table of contents opened on a phone, and the apply box opened', async ( {
		browser,
	} ) => {
		const context = await visitor( browser, PHONE );
		const page = await context.newPage();
		await page.goto( urls.get( 'legal page' ) ?? '' );
		const contents = page.getByRole( 'navigation', {
			name: 'On this page',
		} );
		// The script folds the list on a phone; a visitor opens it.
		await expect( contents.getByRole( 'link' ) ).toBeHidden();
		await contents.locator( 'summary' ).click();
		await expect( contents.getByRole( 'link' ) ).toBeVisible();
		expect( await violations( page ) ).toEqual( [] );

		await page.goto( urls.get( 'job' ) ?? '' );
		await page
			.locator( '.ts-job__card' )
			.getByText( 'Apply for job' )
			.click();
		await expect( page.locator( '.application_details' ) ).toBeVisible();
		// The button changes colour under the pointer over 150ms; half-way
		// through, its text and background are not a pair anyone designed.
		await expect
			.poll( () =>
				page
					.locator( '.ts-job-apply > summary' )
					.evaluate( ( button ) => button.getAnimations().length )
			)
			.toBe( 0 );
		expect( await violations( page ) ).toEqual( [] );
		await context.close();
	} );

	test( 'the job submission form and the dashboard, signed in', async ( {
		page,
	} ) => {
		// Not ours: WordPress's toolbar for signed-in users, and the buttons of
		// its text editor (TinyMCE), which the description field uses.
		const toolbar = [ '#wpadminbar', '.mce-tinymce' ];
		for ( const viewport of [ DESKTOP, PHONE ] ) {
			await page.setViewportSize( viewport );
			await page.goto( urls.get( 'job submission' ) ?? '' );
			await expect( page.locator( '#submit-job-form' ) ).toBeVisible();
			expect(
				await violations( page, toolbar ),
				`submission form at ${ viewport.width }px`
			).toEqual( [] );

			await page.goto( urls.get( 'job dashboard' ) ?? '' );
			await expect(
				page.locator( '#job-manager-job-dashboard' )
			).toBeVisible();
			expect(
				await violations( page, toolbar ),
				`dashboard at ${ viewport.width }px`
			).toEqual( [] );
		}
	} );

	test( 'keyboard focus is never left under the sticky header', async ( {
		browser,
	} ) => {
		const context = await visitor( browser, DESKTOP );
		const page = await context.newPage();
		await page.goto( '/events/' );
		const links = await page
			.locator( 'main a[href]' )
			.filter( { visible: true } )
			.count();
		expect( links ).toBeGreaterThan( 10 );

		// Backwards from the end of the page, each stop scrolls in at the top
		// of the screen, where the header is: whatever takes focus must be
		// what is on top where it sits.
		const covered: unknown[] = [];
		for ( let i = 0; i < links + 30; i++ ) {
			await page.keyboard.press( 'Shift+Tab' );
			covered.push(
				...( await page.evaluate( () =>
					Array.from( document.querySelectorAll( 'main :focus' ) )
						.filter( ( el ) => {
							const box = el.getBoundingClientRect();
							return document
								.elementFromPoint(
									box.left + box.width / 2,
									box.top + box.height / 2
								)
								?.closest( 'header' );
						} )
						.map( ( el ) => el.textContent )
				) )
			);
		}
		expect( covered ).toEqual( [] );
		await context.close();
	} );

	// Text over a photo: axe can't tell what is behind it, so measure the
	// pixels, on the photo that leaves each text the least contrast.
	test( 'text over a photo stays readable whatever the photo', async ( {
		browser,
	} ) => {
		for ( const viewport of [ DESKTOP, TABLET, PHONE ] ) {
			const context = await visitor( browser, viewport );
			const page = await context.newPage();
			const at = `at ${ viewport.width }px`;

			// A card's month and year: small text, 4.5 to 1.
			await page.goto( '/events/' );
			for ( const [ tone ] of TONES ) {
				const month = page
					.locator( '.ts-post-card', {
						hasText: `E2E A11y ${ tone }`,
					} )
					.first()
					.locator( '.ts-card-date__month time' );
				expect(
					await textContrast( month ),
					`${ tone } card ${ at }`
				).toBeGreaterThanOrEqual( 4.5 );
			}

			// The hero: 3 to 1 for its large heading, 4.5 to 1 for the rest.
			await page.goto( urls.get( 'hero over a white photo' ) ?? '' );
			const hero = page.locator( '.wp-block-cover' ).first();
			expect(
				await textContrast( hero.getByRole( 'heading', { level: 1 } ) ),
				`hero heading ${ at }`
			).toBeGreaterThanOrEqual( 3 );
			expect(
				await textContrast( hero.locator( 'p.has-lead-font-size' ) ),
				`hero lead ${ at }`
			).toBeGreaterThanOrEqual( 4.5 );
			expect(
				await textContrast( hero.locator( '.is-style-outline a' ) ),
				`hero outline button ${ at }`
			).toBeGreaterThanOrEqual( 4.5 );
			await context.close();
		}
	} );
} );
