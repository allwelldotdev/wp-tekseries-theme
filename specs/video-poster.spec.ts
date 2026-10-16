import { writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
	test,
	expect,
	RequestUtils,
	type Admin,
} from '@wordpress/e2e-test-utils-playwright';
import type { Page } from '@playwright/test';

type Media = {
	id: number;
	source_url: string;
	featured_media: number;
	meta: { tekseries_poster_of: number };
};
type Linked = { id: number; link: string };

// A real, decodable clip (Twenty Twenty-Two's birds.mp4, GPL).
const VIDEO = path.join( __dirname, 'fixtures/birds.mp4' );
const PHOTO = path.join(
	__dirname,
	'../wp-content/themes/tekseries/assets/images/home/about.jpg'
);
// A file WordPress takes as a video but no browser can play.
const BROKEN = path.join( os.tmpdir(), 'e2e-poster-broken.mp4' );
const MP4_HEADER =
	'000000206674797069736f6d0000020069736f6d69736f32617663316d70343100000008667265650000';
const FRAME = /^Use the frame at \d+:\d\d(\.\d)? as the poster$/;

// The poster frame picker in a video's details, in wp-admin: three frames
// grabbed in the browser, and the one clicked becomes the video's featured
// image, which the Gallery and its viewer show.
test.describe( 'video poster picker', () => {
	const media: number[] = [];
	const albums: number[] = [];
	const pages: number[] = [];

	const upload = async (
		requestUtils: RequestUtils,
		file: string,
		data: Record< string, unknown > = {}
	) => {
		const { id } = await requestUtils.uploadMedia( file );
		media.push( id );
		return requestUtils.rest< Media >( {
			method: 'POST',
			path: `/wp/v2/media/${ id }`,
			data,
		} );
	};

	const read = ( requestUtils: RequestUtils, id: number ) =>
		requestUtils.rest< Media >( {
			path: `/wp/v2/media/${ id }`,
			params: { context: 'edit' },
		} );

	const exists = async ( requestUtils: RequestUtils, id: number ) =>
		(
			await requestUtils.rest< Media[] >( {
				path: '/wp/v2/media',
				params: { include: String( id ), context: 'edit' },
			} )
		).length === 1;

	const openDetails = async ( admin: Admin, page: Page, id: number ) => {
		await admin.visitAdminPage( 'upload.php', `item=${ id }&mode=grid` );
		return page.locator( '.ts-poster-picker' );
	};

	const keepPoster = ( id: number ) => {
		if ( id && ! media.includes( id ) ) {
			media.push( id );
		}
	};

	test.beforeAll( () => {
		writeFileSync( BROKEN, Buffer.from( MP4_HEADER, 'hex' ) );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		for ( const id of media ) {
			try {
				await requestUtils.deleteMedia( id );
			} catch {
				// Already deleted by the picker.
			}
		}
		for ( const id of albums ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/media_album/${ id }`,
				params: { force: true },
			} );
		}
		for ( const id of pages ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/pages/${ id }`,
				params: { force: true },
			} );
		}
	} );

	test( 'a video shows three frames; a photo shows no picker', async ( {
		admin,
		page,
		requestUtils,
	} ) => {
		const video = await upload( requestUtils, VIDEO );
		const picker = await openDetails( admin, page, video.id );
		await expect(
			picker.getByRole( 'button', { name: FRAME } )
		).toHaveCount( 3, { timeout: 30000 } );
		await expect( picker ).toContainText( 'No poster yet' );

		// A video outside any album gets no poster until one is picked.
		expect( ( await read( requestUtils, video.id ) ).featured_media ).toBe(
			0
		);

		// The clip is a second long, so the moments read to a tenth of a
		// second. "Show other frames" grabs three new frames (the moments
		// may repeat on a clip this short; the unit tests cover the spread).
		const frames = picker.getByRole( 'button', { name: FRAME } );
		expect( new Set( await frames.allInnerTexts() ).size ).toBe( 3 );
		const images = () =>
			frames
				.locator( 'img' )
				.evaluateAll( ( list ) =>
					list.map( ( img ) => ( img as HTMLImageElement ).src )
				);
		const first = await images();
		await picker
			.getByRole( 'button', { name: 'Show other frames' } )
			.click();
		await expect
			.poll( async () =>
				( await images() ).filter( ( src ) => first.includes( src ) )
			)
			.toEqual( [] );
		await expect( frames ).toHaveCount( 3 );

		const photo = await upload( requestUtils, PHOTO );
		await openDetails( admin, page, photo.id );
		// The details have loaded once the album field shows.
		await expect(
			page.getByRole( 'textbox', { name: 'Albums' } )
		).toBeVisible();
		await expect( page.locator( '.ts-poster-picker' ) ).toHaveCount( 0 );
	} );

	test( 'the frame clicked becomes the poster in the Gallery and its viewer; picking again deletes only a poster the picker made', async ( {
		admin,
		page,
		requestUtils,
	} ) => {
		const { id: album } = await requestUtils.rest< { id: number } >( {
			method: 'POST',
			path: '/wp/v2/media_album',
			data: { name: 'E2E Poster Album', meta: { tekseries_year: 2026 } },
		} );
		albums.push( album );
		// A poster added by hand first: it must survive the picker.
		const byHand = await upload( requestUtils, PHOTO );
		const video = await upload( requestUtils, VIDEO, {
			media_album: [ album ],
			caption: 'E2E poster clip',
			featured_media: byHand.id,
		} );

		const picker = await openDetails( admin, page, video.id );
		await expect( picker ).toContainText( 'The current poster' );
		const frames = picker.getByRole( 'button', { name: FRAME } );
		await expect( frames ).toHaveCount( 3, { timeout: 30000 } );
		await frames.nth( 2 ).click();
		await expect( picker.getByRole( 'status' ) ).toHaveText(
			'Poster set.'
		);

		const first = ( await read( requestUtils, video.id ) ).featured_media;
		keepPoster( first );
		expect( first ).not.toBe( byHand.id );
		const made = await read( requestUtils, first );
		expect( made.meta.tekseries_poster_of ).toBe( video.id );
		expect( made.source_url ).toMatch( /birds(-\d+)?-poster(-\d+)?\.jpg$/ );
		expect( await exists( requestUtils, byHand.id ) ).toBe( true );

		// Picking again replaces the poster the picker made, and deletes it.
		await frames.nth( 0 ).click();
		await expect
			.poll(
				async () =>
					( await read( requestUtils, video.id ) ).featured_media
			)
			.not.toBe( first );
		const second = ( await read( requestUtils, video.id ) ).featured_media;
		keepPoster( second );
		await expect.poll( () => exists( requestUtils, first ) ).toBe( false );

		const gallery = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Poster Gallery',
				status: 'publish',
				content: '<!-- wp:tekseries/media-gallery /-->',
			},
		} );
		pages.push( gallery.id );
		const poster = ( await read( requestUtils, second ) ).source_url;
		const stem = poster
			.split( '/' )
			.pop()!
			.replace( /\.jpg$/, '' );

		await page.goto( gallery.link );
		const tile = page.getByRole( 'link', {
			name: 'Play video: E2E poster clip',
		} );
		await expect( tile.locator( 'img' ) ).toHaveAttribute(
			'src',
			new RegExp( stem )
		);
		await tile.click();
		const viewer = page.getByRole( 'dialog', { name: 'Media viewer' } );
		await expect( viewer.locator( 'video' ) ).toHaveAttribute(
			'poster',
			new RegExp( stem )
		);
	} );

	test( 'a video in an album with no poster gets the middle frame when opened', async ( {
		admin,
		page,
		requestUtils,
	} ) => {
		const { id: album } = await requestUtils.rest< { id: number } >( {
			method: 'POST',
			path: '/wp/v2/media_album',
			data: { name: 'E2E Auto Poster', meta: { tekseries_year: 2026 } },
		} );
		albums.push( album );
		const video = await upload( requestUtils, VIDEO, {
			media_album: [ album ],
		} );

		const picker = await openDetails( admin, page, video.id );
		await expect( picker.getByRole( 'status' ) ).toContainText(
			'the middle frame is now its poster',
			{ timeout: 30000 }
		);
		const poster = ( await read( requestUtils, video.id ) ).featured_media;
		keepPoster( poster );
		expect( poster ).toBeGreaterThan( 0 );
		await expect(
			picker.getByRole( 'img', { name: 'The current poster' } )
		).toBeVisible();
	} );

	test( 'the "Edit Media" screen has the picker, and Update keeps the poster', async ( {
		admin,
		page,
		requestUtils,
	} ) => {
		const video = await upload( requestUtils, VIDEO );
		await admin.visitAdminPage(
			'post.php',
			`post=${ video.id }&action=edit`
		);
		const picker = page.locator( '.ts-poster-picker' );
		const frames = picker.getByRole( 'button', { name: FRAME } );
		await expect( frames ).toHaveCount( 3, { timeout: 30000 } );
		await frames.nth( 1 ).click();
		await expect( picker.getByRole( 'status' ) ).toHaveText(
			'Poster set.'
		);
		const poster = ( await read( requestUtils, video.id ) ).featured_media;
		keepPoster( poster );
		expect( poster ).toBeGreaterThan( 0 );

		// The form's own featured image field must not undo the pick.
		await page.getByRole( 'button', { name: 'Update' } ).click();
		await expect( page.locator( '#message' ) ).toBeVisible();
		expect( ( await read( requestUtils, video.id ) ).featured_media ).toBe(
			poster
		);
	} );

	test( 'a video no browser can play says so and sets nothing', async ( {
		admin,
		page,
		requestUtils,
	} ) => {
		const { id: album } = await requestUtils.rest< { id: number } >( {
			method: 'POST',
			path: '/wp/v2/media_album',
			data: { name: 'E2E Broken Clip', meta: { tekseries_year: 2026 } },
		} );
		albums.push( album );
		const video = await upload( requestUtils, BROKEN, {
			media_album: [ album ],
		} );
		const picker = await openDetails( admin, page, video.id );
		await expect( picker.getByRole( 'status' ) ).toContainText(
			'can’t play this video',
			{ timeout: 30000 }
		);
		await expect(
			picker.getByRole( 'button', { name: FRAME } )
		).toHaveCount( 0 );
		expect( ( await read( requestUtils, video.id ) ).featured_media ).toBe(
			0
		);
	} );

	test( 'an author can’t pick a poster for someone else’s video', async ( {
		browser,
		requestUtils,
	} ) => {
		const video = await upload( requestUtils, VIDEO );
		const author = {
			username: 'e2e-poster-author',
			email: 'e2e-poster-author@example.org',
			password: 'e2e-poster-author-pass',
			roles: [ 'author' ],
		};
		await requestUtils.deleteAllUsers();
		await requestUtils.createUser( author );
		const storageStatePath = path.join(
			os.tmpdir(),
			'e2e-poster-author.json'
		);
		const asAuthor = await RequestUtils.setup( {
			user: author,
			storageStatePath,
			baseURL: process.env.WP_BASE_URL,
		} );
		await asAuthor.login();
		await asAuthor.request.storageState( { path: storageStatePath } );
		const context = await browser.newContext( {
			storageState: storageStatePath,
			baseURL: process.env.WP_BASE_URL,
		} );
		try {
			const page = await context.newPage();
			await page.goto(
				`/wp-admin/upload.php?item=${ video.id }&mode=grid`
			);
			// The details have loaded once the file name shows.
			await expect(
				page.locator( '.media-modal' ).getByText( 'File name:' )
			).toBeVisible();
			await expect( page.locator( '.ts-poster-picker' ) ).toHaveCount(
				0
			);
		} finally {
			await context.close();
			await requestUtils.deleteAllUsers();
		}
	} );

	test( 'public pages load no picker script', async ( { page } ) => {
		const scripts: string[] = [];
		page.on( 'request', ( request ) => {
			scripts.push( request.url() );
		} );
		await page.goto( '/' );
		expect(
			scripts.filter( ( url ) => url.includes( 'video-poster' ) )
		).toEqual( [] );
	} );
} );
