import { writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { invalidBlocks } from './utils/blocks';

type Linked = { id: number; link: string; title: { rendered: string } };
type Uploaded = { id: number; source_url: string };

const PHOTO = path.join(
	__dirname,
	'../wp-content/themes/tekseries/assets/images/home/about.jpg'
);
// The smallest file WordPress accepts as a video: an MP4 header and nothing else.
const CLIP = path.join( os.tmpdir(), 'e2e-post-clip.mp4' );
const MP4_HEADER =
	'000000206674797069736f6d0000020069736f6d69736f32617663316d70343100000008667265650000';
// What stands in for YouTube and Vimeo in these tests.
const PLAYER =
	'<!doctype html><html lang="en"><head><title>Player</title></head><body><p>Stub player</p></body></html>';

// Their addresses (the test posts' own addresses have the names in them).
const SERVICES =
	/^https:\/\/([a-z-]+\.)*(youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com)\//;

const YOUTUBE = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const YOUTUBE_PLAYER =
	'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0';

// A news post can carry a video, set in its "Video" fields: a file from the
// Media Library, or a YouTube or Vimeo link. The Post Video block, in the
// single post template, shows a card that opens it in the Gallery's viewer.
test.describe( 'Post Video block', () => {
	const posts = new Map< string, Linked >();
	let photo: Uploaded;
	let clip: Uploaded;

	test.beforeAll( async ( { requestUtils } ) => {
		writeFileSync( CLIP, Buffer.from( MP4_HEADER, 'hex' ) );
		photo = await requestUtils.uploadMedia( PHOTO );
		clip = await requestUtils.uploadMedia( CLIP );

		for ( const [ name, acf ] of [
			[
				'file',
				{
					tekseries_video: true,
					tekseries_video_file: clip.id,
					tekseries_video_thumbnail: photo.id,
				},
			],
			// The file wins when a post has both.
			[
				'file and link',
				{
					tekseries_video: true,
					tekseries_video_file: clip.id,
					tekseries_video_link: YOUTUBE,
				},
			],
			[
				'youtube',
				{ tekseries_video: true, tekseries_video_link: YOUTUBE },
			],
			[
				'short youtube',
				{
					tekseries_video: true,
					tekseries_video_link: 'https://youtu.be/dQw4w9WgXcQ?t=42',
				},
			],
			[
				'vimeo',
				{
					tekseries_video: true,
					tekseries_video_link: 'https://vimeo.com/76979871',
				},
			],
			// Switched off, or not a video the block can show: no card.
			[
				'off',
				{ tekseries_video: false, tekseries_video_link: YOUTUBE },
			],
			[
				'elsewhere',
				{
					tekseries_video: true,
					tekseries_video_link:
						'https://example.com/watch?v=dQw4w9WgXcQ',
				},
			],
			[ 'empty', { tekseries_video: true } ],
		] as const ) {
			posts.set(
				name,
				await requestUtils.rest< Linked >( {
					method: 'POST',
					path: '/wp/v2/posts',
					data: {
						title: `E2E Video ${ name }`,
						status: 'publish',
						content: 'A post.',
						acf,
					},
				} )
			);
		}
	} );

	test.afterAll( async ( { requestUtils } ) => {
		for ( const { id } of posts.values() ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/posts/${ id }`,
				params: { force: true },
			} );
		}
		await requestUtils.deleteMedia( photo.id );
		await requestUtils.deleteMedia( clip.id );
	} );

	const link = ( name: string ) => posts.get( name )?.link ?? '';

	test( 'shows a card that links to the video, with JavaScript off, and nothing without a video', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			javaScriptEnabled: false,
			storageState: { cookies: [], origins: [] },
		} );
		const asked: string[] = [];
		await context.route( SERVICES, ( route ) => {
			asked.push( route.request().url() );
			return route.fulfill( { contentType: 'text/html', body: PLAYER } );
		} );
		const page = await context.newPage();
		const card = page.locator(
			'.wp-block-tekseries-post-video a.ts-post-video__card'
		);

		// A file: the card shows the chosen thumbnail and links to the file.
		await page.goto( link( 'file' ) );
		await expect( card ).toHaveAttribute( 'href', clip.source_url );
		await expect( card ).toHaveText( 'Watch the video' );
		await expect( card.locator( 'img' ) ).toHaveAttribute( 'src', /about/ );
		await page.goto( link( 'file and link' ) );
		await expect( card ).toHaveAttribute( 'href', clip.source_url );

		// A link: the card leads to the video's own page, on a plain card.
		await page.goto( link( 'youtube' ) );
		await expect( card ).toHaveAttribute( 'href', YOUTUBE );
		await expect( card ).toHaveClass( /ts-post-video__card--plain/ );
		await expect( card.locator( 'img' ) ).toHaveCount( 0 );

		for ( const name of [ 'off', 'elsewhere', 'empty' ] ) {
			await page.goto( link( name ) );
			await expect(
				page.locator( '.wp-block-tekseries-post-video' ),
				name
			).toHaveCount( 0 );
			await expect(
				page.locator( 'dialog.ts-lightbox' ),
				name
			).toHaveCount( 0 );
		}
		// Nothing is asked of the services by any of these pages.
		expect( asked ).toEqual( [] );
		await context.close();
	} );

	test( 'opens a link in an embedded player, which is gone once the viewer closes', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			storageState: { cookies: [], origins: [] },
		} );
		const asked: string[] = [];
		await context.route( SERVICES, ( route ) => {
			asked.push( route.request().url() );
			return route.fulfill( { contentType: 'text/html', body: PLAYER } );
		} );
		const page = await context.newPage();
		const scripts: string[] = [];
		page.on( 'request', ( request ) => scripts.push( request.url() ) );
		const card = page.locator( 'a.ts-post-video__card' );
		const viewer = page.getByRole( 'dialog', { name: 'Media viewer' } );
		const player = viewer.locator( 'iframe.ts-lightbox__embed' );

		await page.goto( link( 'youtube' ) );
		await page.waitForLoadState( 'load' );
		// Nothing of YouTube's before the visitor asks for the video.
		expect( asked ).toEqual( [] );
		await expect( player ).toHaveCount( 0 );

		await card.click();
		await expect( viewer ).toBeVisible();
		await expect( viewer ).toHaveClass( /\bis-single\b/ );
		await expect( player ).toHaveAttribute( 'src', YOUTUBE_PLAYER );
		await expect( player ).toHaveAttribute( 'title', 'E2E Video youtube' );
		await expect(
			page
				.frameLocator( 'iframe.ts-lightbox__embed' )
				.getByText( 'Stub player' )
		).toBeVisible();
		await expect( viewer.locator( '.ts-lightbox__photo' ) ).toBeHidden();
		await expect( viewer.locator( 'video' ) ).toBeHidden();
		expect( asked ).toEqual( [ YOUTUBE_PLAYER ] );
		// The address did not change: Back still leaves the page.
		await expect( page ).toHaveURL( link( 'youtube' ) );

		// Closing takes the player away, which stops the video.
		await page.keyboard.press( 'Escape' );
		await expect( viewer ).toBeHidden();
		await expect( player ).toHaveCount( 0 );
		await expect( card ).toBeFocused();

		// The other ways to write a link give the same kind of address.
		await page.goto( link( 'short youtube' ) );
		await card.click();
		await expect( player ).toHaveAttribute( 'src', YOUTUBE_PLAYER );
		await page.goto( link( 'vimeo' ) );
		await card.click();
		await expect( player ).toHaveAttribute(
			'src',
			'https://player.vimeo.com/video/76979871?autoplay=1&dnt=1'
		);

		expect(
			scripts.filter( ( url ) => /react|jquery/i.test( url ) )
		).toEqual( [] );
		await context.close();
	} );

	test( 'opens a file in the viewer, with the thumbnail as its poster', async ( {
		page,
	} ) => {
		await page.goto( link( 'file' ) );
		await page.locator( 'a.ts-post-video__card' ).click();
		const viewer = page.getByRole( 'dialog', { name: 'Media viewer' } );
		const video = viewer.locator( 'video' );
		await expect( video ).toBeVisible();
		await expect( video ).toHaveAttribute( 'src', clip.source_url );
		await expect( video ).toHaveAttribute( 'poster', /about/ );
		await expect( viewer.locator( 'iframe' ) ).toHaveCount( 0 );
	} );

	test( 'is insertable and valid in the post editor', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost( { title: 'E2E Video Editor' } );
		await editor.insertBlock( { name: 'tekseries/post-video' } );
		await expect(
			editor.canvas.getByText( 'Watch the video' )
		).toBeVisible();
		expect( await invalidBlocks( page ) ).toEqual( [] );
	} );
} );
