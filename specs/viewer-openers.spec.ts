import { writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

type Linked = { id: number; link: string };
type Uploaded = { id: number; source_url: string };

const PHOTO = path.join(
	__dirname,
	'../wp-content/themes/tekseries/assets/images/home/about.jpg'
);
// A picture file narrower than the frame it is shown in (218 by 150).
const SMALL = path.join(
	__dirname,
	'../wp-content/themes/tekseries/assets/images/logo-stacked.png'
);
// The smallest file WordPress accepts as a video: an MP4 header and nothing else.
const CLIP = path.join( os.tmpdir(), 'e2e-opener-clip.mp4' );
const MP4_HEADER =
	'000000206674797069736f6d0000020069736f6d69736f32617663316d70343100000008667265650000';

const button = ( name: string, href: string, text: string ) =>
	`<!-- wp:button {"className":"ts-lightbox-open ${ name }"} --><div class="wp-block-button ts-lightbox-open ${ name }"><a class="wp-block-button__link wp-element-button" href="${ href }">${ text }</a></div><!-- /wp:button -->`;
const buttons = ( inner: string[] ) =>
	`<!-- wp:buttons --><div class="wp-block-buttons">${ inner.join(
		''
	) }</div><!-- /wp:buttons -->`;

// The Gallery's viewer also opens from links elsewhere: a block with the class
// "ts-lightbox-open" whose link leads to a photo or a video file. The event
// page's poster and the Home page's "See video" use it.
test.describe( 'Viewer openers', () => {
	let photo: Uploaded;
	let small: Uploaded;
	let clip: Uploaded;
	let openers: Linked;
	let withGallery: Linked;
	let poster: Linked;
	let bare: Linked;
	let album: number;

	test.beforeAll( async ( { requestUtils } ) => {
		writeFileSync( CLIP, Buffer.from( MP4_HEADER, 'hex' ) );
		const upload = async (
			file: string,
			data: Record< string, unknown >
		) => {
			const { id } = await requestUtils.uploadMedia( file );
			return requestUtils.rest< Uploaded >( {
				method: 'POST',
				path: `/wp/v2/media/${ id }`,
				data,
			} );
		};
		album = (
			await requestUtils.rest< { id: number } >( {
				method: 'POST',
				path: '/wp/v2/media_album',
				data: { name: 'E2E Openers', meta: { tekseries_year: 2025 } },
			} )
		).id;
		photo = await upload( PHOTO, {
			caption: 'E2E opener photo',
			media_album: [ album ],
		} );
		small = await upload( SMALL, { alt_text: 'E2E poster alt' } );
		clip = await upload( CLIP, { caption: 'E2E opener clip' } );

		const page = ( title: string, content: string ) =>
			requestUtils.rest< Linked >( {
				method: 'POST',
				path: '/wp/v2/pages',
				data: { title, status: 'publish', content },
			} );
		openers = await page(
			'E2E Viewer Openers',
			buttons( [
				button( 'e2e-photo', photo.source_url, 'View photo' ),
				button( 'e2e-clip', clip.source_url, 'See clip' ),
				// Not files: these stay ordinary links.
				button( 'e2e-nowhere', '#', 'Nowhere' ),
				button( 'e2e-page', '/events/', 'A page' ),
			] )
		);
		withGallery = await page(
			'E2E Viewer With Gallery',
			buttons( [ button( 'e2e-clip', clip.source_url, 'See clip' ) ] ) +
				'<!-- wp:tekseries/media-gallery /-->'
		);
		poster = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/event',
			data: {
				title: 'E2E Poster Event',
				status: 'publish',
				featured_media: small.id,
			},
		} );
		bare = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/event',
			data: { title: 'E2E Bare Event', status: 'publish' },
		} );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		for ( const { id } of [ openers, withGallery ] ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/pages/${ id }`,
				params: { force: true },
			} );
		}
		for ( const { id } of [ poster, bare ] ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/event/${ id }`,
				params: { force: true },
			} );
		}
		await requestUtils.deleteMedia( photo.id );
		await requestUtils.deleteMedia( small.id );
		await requestUtils.deleteMedia( clip.id );
		await requestUtils.rest( {
			method: 'DELETE',
			path: `/wp/v2/media_album/${ album }`,
			params: { force: true },
		} );
	} );

	test( 'the links open their files with JavaScript off, and only file links are openers', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			javaScriptEnabled: false,
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		await page.goto( openers.link );

		await expect(
			page.getByRole( 'link', { name: 'View photo' } )
		).toHaveAttribute( 'href', photo.source_url );
		await expect(
			page.getByRole( 'link', { name: 'See clip' } )
		).toHaveAttribute( 'href', clip.source_url );
		for ( const name of [ 'View photo', 'See clip' ] ) {
			await expect( page.getByRole( 'link', { name } ) ).toHaveAttribute(
				'data-wp-on--click',
				'actions.openOne'
			);
		}
		for ( const name of [ 'Nowhere', 'A page' ] ) {
			await expect(
				page.getByRole( 'link', { name } )
			).not.toHaveAttribute( 'data-wp-on--click' );
		}
		// The viewer is on the page once, closed.
		await expect( page.locator( 'dialog.ts-lightbox' ) ).toHaveCount( 1 );
		await expect( page.locator( 'dialog.ts-lightbox' ) ).toBeHidden();
		await context.close();
	} );

	test( 'a photo and a video open alone in the viewer, and focus returns', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		const scripts: string[] = [];
		page.on( 'request', ( request ) => scripts.push( request.url() ) );
		await page.goto( openers.link );

		const viewer = page.getByRole( 'dialog', { name: 'Media viewer' } );
		const link = page.getByRole( 'link', { name: 'View photo' } );
		await link.click();
		await expect( viewer ).toBeVisible();
		await expect( viewer ).toHaveClass( /\bis-single\b/ );
		await expect( viewer.locator( '.ts-lightbox__photo' ) ).toHaveAttribute(
			'src',
			photo.source_url
		);
		await expect( viewer.locator( 'figcaption' ) ).toHaveText(
			'E2E opener photo'
		);
		// Nothing to step through.
		await expect(
			viewer.getByRole( 'button', { name: 'Next' } )
		).toHaveCount( 0 );
		await expect( viewer.locator( '.ts-lightbox__thumbs' ) ).toBeHidden();
		await expect(
			viewer.locator( '.ts-lightbox__counter [aria-hidden]' )
		).toBeHidden();
		await expect( page ).toHaveURL( openers.link );

		await page.keyboard.press( 'Escape' );
		await expect( viewer ).toBeHidden();
		await expect( link ).toBeFocused();

		await page.getByRole( 'link', { name: 'See clip' } ).click();
		const video = viewer.locator( 'video' );
		await expect( video ).toBeVisible();
		await expect( video ).toHaveAttribute( 'src', clip.source_url );
		await expect( viewer.locator( '.ts-lightbox__photo' ) ).toBeHidden();
		await viewer.getByRole( 'button', { name: 'Close viewer' } ).click();
		await expect( viewer ).toBeHidden();

		expect(
			scripts.filter( ( url ) => /react|jquery/i.test( url ) )
		).toEqual( [] );
		expect(
			scripts.filter( ( url ) => /media-gallery\/view\.js/.test( url ) )
		).toHaveLength( 1 );
		await context.close();
	} );

	test( 'a page with the Gallery has one viewer, which openers and tiles share', async ( {
		page,
	} ) => {
		await page.goto( withGallery.link );
		await expect( page.locator( 'dialog.ts-lightbox' ) ).toHaveCount( 1 );
		const viewer = page.getByRole( 'dialog', { name: 'Media viewer' } );

		await page.getByRole( 'link', { name: 'See clip' } ).click();
		await expect( viewer ).toHaveClass( /\bis-single\b/ );
		await expect( viewer.locator( 'video' ) ).toBeVisible();
		await page.keyboard.press( 'Escape' );
		await expect( viewer ).toBeHidden();

		// The Gallery's one tile is alone too.
		await page.getByRole( 'link', { name: /^View photo/ } ).click();
		await expect( viewer ).toBeVisible();
		await expect( viewer.locator( '.ts-lightbox__photo' ) ).toBeVisible();
	} );

	test( 'the event poster sits in a frame, and both it and "View full size" open the viewer', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		await page.goto( poster.link );

		const frame = page.locator( '.ts-poster' );
		await expect( frame ).toBeVisible();
		await expect( frame ).toContainText( 'Event poster' );
		const full = frame.getByRole( 'link', {
			name: 'View full size',
			exact: true,
		} );
		await expect( full ).toHaveAttribute( 'href', small.source_url );
		const picture = frame.getByRole( 'link', {
			name: 'View full size: E2E poster alt',
		} );
		await expect( picture ).toHaveAttribute( 'href', small.source_url );

		// A file narrower than the frame is still drawn square, with the
		// caption row under it and not over it.
		const drawn = await frame.locator( 'img' ).boundingBox();
		const row = await frame.locator( '.ts-poster__caption' ).boundingBox();
		expect( Math.round( drawn?.height ?? 0 ) ).toBe(
			Math.round( drawn?.width ?? -1 )
		);
		expect( row?.y ?? 0 ).toBeGreaterThanOrEqual(
			( drawn?.y ?? 0 ) + ( drawn?.height ?? 0 )
		);

		const viewer = page.getByRole( 'dialog', { name: 'Media viewer' } );
		await picture.click();
		await expect( viewer ).toBeVisible();
		await expect( viewer.locator( '.ts-lightbox__photo' ) ).toHaveAttribute(
			'src',
			small.source_url
		);
		await page.keyboard.press( 'Escape' );
		await expect( picture ).toBeFocused();

		await full.click();
		await expect( viewer ).toBeVisible();
		await expect( viewer ).toHaveClass( /\bis-single\b/ );
		await page.keyboard.press( 'Escape' );
		await expect( full ).toBeFocused();

		// No picture, no frame, and nothing of the viewer.
		const scripts: string[] = [];
		page.on( 'request', ( request ) => scripts.push( request.url() ) );
		await page.goto( bare.link );
		await expect( page.locator( '.ts-poster' ) ).toHaveCount( 0 );
		await expect( page.getByText( 'Event poster' ) ).toHaveCount( 0 );
		await expect( page.locator( 'dialog.ts-lightbox' ) ).toHaveCount( 0 );
		expect(
			scripts.filter( ( url ) => /media-gallery\/view\.js/.test( url ) )
		).toEqual( [] );
		await context.close();
	} );
} );
