import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { invalidBlocks } from './utils/blocks';

type Linked = { id: number; link: string };

const SRC = 'https://www.google.com/maps/embed?pb=!1m2!1se2e&hl=en';
const map = ( attributes: Record< string, string > ) =>
	`<!-- wp:tekseries/map ${ JSON.stringify( attributes ) } /-->`;
// What stands in for Google in these tests.
const STUB =
	'<!doctype html><html lang="en"><head><title>Map</title></head><body><p>Stub map</p></body></html>';

// The Map block frames a Google Maps embed and nothing else. It is built on
// the server and has no script of its own.
test.describe( 'Map block', () => {
	let place: Linked;

	test.beforeAll( async ( { requestUtils } ) => {
		place = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Map',
				status: 'publish',
				content: [
					map( { src: SRC, title: 'Map: E2E place' } ),
					// Not Google Maps' embed path: nothing may be framed.
					map( { src: 'https://example.com/maps/embed?pb=1' } ),
					map( { src: 'https://www.google.com/maps/embedded?pb=1' } ),
					map( { src: 'javascript:alert(1)' } ),
				].join( '' ),
			},
		} );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.rest( {
			method: 'DELETE',
			path: `/wp/v2/pages/${ place.id }`,
			params: { force: true },
		} );
	} );

	test( 'frames a Google Maps embed, and only that, with JavaScript off', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			javaScriptEnabled: false,
			storageState: { cookies: [], origins: [] },
		} );
		const asked: string[] = [];
		await context.route( 'https://www.google.com/maps/**', ( route ) => {
			asked.push( route.request().url() );
			return route.fulfill( { contentType: 'text/html', body: STUB } );
		} );
		const page = await context.newPage();
		const ours: string[] = [];
		page.on( 'request', ( request ) => {
			if ( /tekseries-blocks\/build\/.*\.js/.test( request.url() ) ) {
				ours.push( request.url() );
			}
		} );
		await page.goto( place.link );

		// One frame: the three other blocks printed nothing.
		const frames = page.locator( '.wp-block-tekseries-map iframe' );
		await expect( frames ).toHaveCount( 1 );
		await expect( page.locator( '.wp-block-tekseries-map' ) ).toHaveCount(
			1
		);
		await expect( frames ).toHaveAttribute( 'src', SRC );
		await expect( frames ).toHaveAttribute( 'title', 'Map: E2E place' );
		await expect( frames ).toHaveAttribute( 'loading', 'lazy' );
		expect( ( await frames.boundingBox() )?.height ).toBe( 450 );
		await expect(
			page
				.frameLocator( '.wp-block-tekseries-map iframe' )
				.getByText( 'Stub map' )
		).toBeVisible();
		expect( asked ).toEqual( [ SRC ] );
		expect( ours ).toEqual( [] );
		await context.close();
	} );

	test( 'takes Google’s embed code in the editor and asks nothing of Google there', async ( {
		admin,
		editor,
		page,
	} ) => {
		const asked: string[] = [];
		page.on( 'request', ( request ) => {
			if ( /google\.com\/maps/.test( request.url() ) ) {
				asked.push( request.url() );
			}
		} );
		await admin.createNewPost( { postType: 'page' } );
		const patterns = page.getByRole( 'dialog', {
			name: 'Choose a pattern',
		} );
		// eslint-disable-next-line playwright/no-conditional-in-test
		if ( await patterns.isVisible() ) {
			await patterns.getByRole( 'button', { name: 'Close' } ).click();
		}
		await editor.insertBlock( { name: 'tekseries/map' } );
		const source = async () =>
			( await editor.getBlocks() )[ 0 ]?.attributes.src;

		// The whole snippet is pasted; the block keeps the address alone.
		const code = editor.canvas.getByRole( 'textbox', {
			name: 'Google Maps embed code',
		} );
		await code.fill(
			`<iframe src="${ SRC.replace(
				'&',
				'&amp;'
			) }" width="600" height="450" style="border:0;" loading="lazy"></iframe>`
		);
		expect( await source() ).toBe( SRC );
		await expect(
			editor.canvas.getByText( 'The map shows on the site.' )
		).toBeVisible();

		// Anything else is refused, and the map stays as it was.
		await editor.openDocumentSettingsSidebar();
		const settings = page.getByRole( 'region', {
			name: 'Editor settings',
		} );
		await settings
			.getByRole( 'textbox', { name: 'Google Maps embed code' } )
			.fill( '<iframe src="https://example.com/embed"></iframe>' );
		await expect(
			settings.getByText( 'That is not a Google Maps embed code' )
		).toBeVisible();
		expect( await source() ).toBe( SRC );

		expect( await invalidBlocks( page ) ).toEqual( [] );
		expect( asked ).toEqual( [] );
	} );
} );
