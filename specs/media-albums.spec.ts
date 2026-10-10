import path from 'node:path';
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

type Album = { id: number; count: number; meta: { tekseries_year: number } };

const PHOTO = path.join(
	__dirname,
	'../wp-content/themes/tekseries/assets/images/home/about.jpg'
);

// Albums are terms on media files; each carries the year its media are from.
test.describe( 'media albums', () => {
	const media: number[] = [];
	const albums: number[] = [];

	test.afterAll( async ( { requestUtils } ) => {
		for ( const id of media ) {
			await requestUtils.deleteMedia( id );
		}
		for ( const id of albums ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/media_album/${ id }`,
				params: { force: true },
			} );
		}
	} );

	test( 'a file put in an album over REST is listed under it', async ( {
		requestUtils,
	} ) => {
		const album = await requestUtils.rest< Album >( {
			method: 'POST',
			path: '/wp/v2/media_album',
			data: { name: 'E2E Album', meta: { tekseries_year: 2025 } },
		} );
		albums.push( album.id );
		expect( album.meta.tekseries_year ).toBe( 2025 );

		const inAlbum = await requestUtils.uploadMedia( PHOTO );
		const outside = await requestUtils.uploadMedia( PHOTO );
		media.push( inAlbum.id, outside.id );
		await requestUtils.rest( {
			method: 'POST',
			path: `/wp/v2/media/${ inAlbum.id }`,
			data: { media_album: [ album.id ] },
		} );

		const listed = await requestUtils.rest< { id: number }[] >( {
			path: '/wp/v2/media',
			params: { media_album: album.id },
		} );
		expect( listed.map( ( { id } ) => id ) ).toEqual( [ inAlbum.id ] );

		// Unattached files count too (core's default counter skips them).
		const { count } = await requestUtils.rest< Album >( {
			path: `/wp/v2/media_album/${ album.id }`,
		} );
		expect( count ).toBe( 1 );
	} );

	test( 'the album forms save the year', async ( {
		admin,
		page,
		requestUtils,
	} ) => {
		await admin.visitAdminPage(
			'edit-tags.php',
			'taxonomy=media_album&post_type=attachment'
		);
		await page.getByRole( 'textbox', { name: 'Name' } ).fill( 'E2E Camp' );
		await page.getByRole( 'spinbutton', { name: 'Year' } ).fill( '2019' );
		await page.getByRole( 'button', { name: 'Add new Album' } ).click();
		const row = page.getByRole( 'row' ).filter( { hasText: 'E2E Camp' } );
		await expect( row ).toBeVisible();

		const [ created ] = await requestUtils.rest< Album[] >( {
			path: '/wp/v2/media_album',
			params: { slug: 'e2e-camp' },
		} );
		expect( created ).toBeDefined();
		const id = created?.id ?? 0;
		albums.push( id );
		expect( created?.meta.tekseries_year ).toBe( 2019 );

		await admin.visitAdminPage(
			'term.php',
			`taxonomy=media_album&tag_ID=${ id }&post_type=attachment`
		);
		const year = page.getByRole( 'spinbutton', { name: 'Year' } );
		await expect( year ).toHaveValue( '2019' );
		await year.fill( '2020' );
		await page.getByRole( 'button', { name: 'Update' } ).click();
		await expect( page.getByText( 'Item updated.' ) ).toBeVisible();

		const updated = await requestUtils.rest< Album >( {
			path: `/wp/v2/media_album/${ id }`,
		} );
		expect( updated.meta.tekseries_year ).toBe( 2020 );
	} );
} );
