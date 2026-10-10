import { writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
	test,
	expect,
	type RequestUtils,
} from '@wordpress/e2e-test-utils-playwright';
import { invalidBlocks } from './utils/blocks';

type Linked = { id: number; link: string };
type Uploaded = { id: number; source_url: string };

const PHOTO = path.join(
	__dirname,
	'../wp-content/themes/tekseries/assets/images/home/about.jpg'
);
// The smallest file WordPress accepts as a video: an MP4 header and nothing else.
const CLIP = path.join( os.tmpdir(), 'e2e-clip.mp4' );
const MP4_HEADER =
	'000000206674797069736f6d0000020069736f6d69736f32617663316d70343100000008667265650000';

const stats = ( key: string ) =>
	`<!-- wp:paragraph {"className":"e2e-${ key }","metadata":{"bindings":{"content":{"source":"tekseries/media-stats","args":{"key":"${ key }"}}}}} --><p class="e2e-${ key }"></p><!-- /wp:paragraph -->`;

// The gallery shows the photos and videos in albums: filters, counts and
// "Load more" are plain links, so everything here runs with JavaScript off.
test.describe( 'Media Gallery block', () => {
	const albums: number[] = [];
	const media: Uploaded[] = [];
	let gallery: Linked;
	let outside: Uploaded;

	const album = async (
		requestUtils: RequestUtils,
		name: string,
		year: number
	) => {
		const { id } = await requestUtils.rest< { id: number } >( {
			method: 'POST',
			path: '/wp/v2/media_album',
			data: { name, meta: { tekseries_year: year } },
		} );
		albums.push( id );
		return id;
	};

	const upload = async (
		requestUtils: RequestUtils,
		file: string,
		data: Record< string, unknown >
	) => {
		const { id } = await requestUtils.uploadMedia( file );
		const item = await requestUtils.rest< Uploaded >( {
			method: 'POST',
			path: `/wp/v2/media/${ id }`,
			data,
		} );
		media.push( item );
		return item;
	};

	test.beforeAll( async ( { requestUtils } ) => {
		writeFileSync( CLIP, Buffer.from( MP4_HEADER, 'hex' ) );
		const camp = await album( requestUtils, 'E2E Camp', 2025 );
		const bootcamp = await album( requestUtils, 'E2E Bootcamp', 2019 );
		const clips = await album( requestUtils, 'E2E Clips', 2025 );

		// Oldest first. The gallery reads newest year, then newest upload:
		// clip, three, two, one (2025), then five, four (2019).
		for ( const [ text, term ] of [
			[ 'one', camp ],
			[ 'two', camp ],
			[ 'three', camp ],
			[ 'four', bootcamp ],
			[ 'five', bootcamp ],
		] as const ) {
			await upload( requestUtils, PHOTO, {
				media_album: [ term ],
				// "two" has alt text only: the label falls back to it.
				...( text === 'two'
					? { alt_text: 'E2E alt two' }
					: { caption: `E2E photo ${ text }` } ),
			} );
		}
		await upload( requestUtils, CLIP, {
			media_album: [ clips ],
			caption: 'E2E clip',
		} );
		outside = await upload( requestUtils, PHOTO, {
			caption: 'E2E outside any album',
		} );

		gallery = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Media Gallery',
				status: 'publish',
				content:
					stats( 'photos' ) +
					stats( 'videos' ) +
					'<!-- wp:tekseries/media-gallery {"perPage":2} /-->',
			},
		} );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		for ( const { id } of media ) {
			await requestUtils.deleteMedia( id );
		}
		for ( const id of albums ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/media_album/${ id }`,
				params: { force: true },
			} );
		}
		await requestUtils.rest( {
			method: 'DELETE',
			path: `/wp/v2/pages/${ gallery.id }`,
			params: { force: true },
		} );
	} );

	test( 'lists album media newest year first and loads more with JavaScript off', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			javaScriptEnabled: false,
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		await page.goto( gallery.link );

		const tiles = page.locator( '.ts-media__grid .ts-media__tile' );
		const labels = () =>
			tiles.evaluateAll( ( links ) =>
				links.map( ( link ) => link.getAttribute( 'aria-label' ) )
			);
		const [ one, two, three, , , clip ] = media;

		expect( await labels() ).toEqual( [
			'Play video: E2E clip',
			'View photo: E2E photo three',
		] );
		// Each tile links to its full file.
		await expect( tiles.first() ).toHaveAttribute(
			'href',
			clip?.source_url ?? ''
		);
		await expect( tiles.nth( 1 ) ).toHaveAttribute(
			'href',
			three?.source_url ?? ''
		);
		await expect( tiles.nth( 1 ).locator( 'img' ) ).toHaveAttribute(
			'alt',
			''
		);
		await expect( page.locator( '.ts-media__showing' ) ).toHaveText(
			'Showing 2 of 6'
		);

		// "Load more" is a link that lands on the first new item.
		const more = page.getByRole( 'link', { name: 'Load more' } );
		await expect( more ).toHaveAttribute(
			'href',
			new RegExp( `media_shown=4#media-${ two?.id }$` )
		);
		await more.click();
		await expect( page.locator( '.ts-media__showing' ) ).toHaveText(
			'Showing 4 of 6'
		);
		expect( await labels() ).toEqual( [
			'Play video: E2E clip',
			'View photo: E2E photo three',
			'View photo: E2E alt two',
			'View photo: E2E photo one',
		] );
		await expect( tiles.nth( 3 ) ).toHaveAttribute(
			'href',
			one?.source_url ?? ''
		);

		await more.click();
		await expect( page.locator( '.ts-media__showing' ) ).toHaveText(
			'Showing 6 of 6'
		);
		await expect( tiles ).toHaveCount( 6 );
		await expect( more ).toHaveCount( 0 );
		// A file in no album never shows.
		await expect(
			page.locator( `a[href="${ outside.source_url }"]` )
		).toHaveCount( 0 );

		await context.close();
	} );

	test( 'filters by year and type, with counts and an empty state', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			javaScriptEnabled: false,
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		await page.goto( gallery.link );

		const types = page
			.getByRole( 'group', { name: 'Show' } )
			.getByRole( 'link' );
		const years = page
			.getByRole( 'group', { name: 'Filter by year' } )
			.getByRole( 'link' );
		const tiles = page.locator( '.ts-media__grid .ts-media__tile' );
		const showing = page.locator( '.ts-media__showing' );

		await expect( types ).toHaveText( [ 'All 6', 'Photos 5', 'Videos 1' ] );
		await expect( years ).toHaveText( [
			'All years 6',
			'2025 4',
			'2019 2',
		] );
		await expect( types.first() ).toHaveAttribute( 'aria-current', 'true' );

		// A year: its two photos, and the type counts follow it.
		await years.nth( 2 ).click();
		await expect( page ).toHaveURL( /media_year=2019#media$/ );
		await expect( showing ).toHaveText( 'Showing 2 of 2' );
		await expect( years.nth( 2 ) ).toHaveAttribute(
			'aria-current',
			'true'
		);
		await expect( years.first() ).not.toHaveAttribute( 'aria-current' );
		await expect( types ).toHaveText( [ 'All 2', 'Photos 2', 'Videos 0' ] );

		// No videos that year: the empty state leads back to everything.
		await types.nth( 2 ).click();
		await expect( page ).toHaveURL( /media_type=video&media_year=2019/ );
		await expect( tiles ).toHaveCount( 0 );
		await expect( page.locator( '.ts-media__empty-title' ) ).toHaveText(
			'No videos from 2019 yet'
		);
		await page.getByRole( 'link', { name: 'Show all media' } ).click();
		await expect( showing ).toHaveText( 'Showing 2 of 6' );

		// A type: the year counts follow it.
		await types.nth( 2 ).click();
		await expect( showing ).toHaveText( 'Showing 1 of 1' );
		await expect( tiles ).toHaveAttribute(
			'aria-label',
			'Play video: E2E clip'
		);
		await expect( years ).toHaveText( [
			'All years 1',
			'2025 1',
			'2019 0',
		] );

		// Values the gallery doesn't know are ignored.
		await page.goto( `${ gallery.link }?media_type=nope&media_year=1999` );
		await expect( showing ).toHaveText( 'Showing 2 of 6' );

		await context.close();
	} );

	test( 'gives templates the totals and loads no React or jQuery', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		const scripts: string[] = [];
		page.on( 'request', ( request ) => scripts.push( request.url() ) );
		await page.goto( gallery.link );

		await expect( page.locator( '.e2e-photos' ) ).toHaveText( '5 photos' );
		await expect( page.locator( '.e2e-videos' ) ).toHaveText( '1 video' );
		expect(
			scripts.filter( ( url ) => /react|jquery/i.test( url ) )
		).toEqual( [] );
		await context.close();
	} );

	test( 'is insertable and valid in the page editor', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost( { postType: 'page' } );
		const patterns = page.getByRole( 'dialog', {
			name: 'Choose a pattern',
		} );
		if ( await patterns.isVisible() ) {
			await patterns.getByRole( 'button', { name: 'Close' } ).click();
		}
		await editor.insertBlock( { name: 'tekseries/media-gallery' } );
		// The preview is the server render: all six fit the default twelve.
		await expect(
			editor.canvas.locator( '.ts-media__showing' )
		).toHaveText( 'Showing 6 of 6' );
		expect( await invalidBlocks( page ) ).toEqual( [] );
	} );
} );
