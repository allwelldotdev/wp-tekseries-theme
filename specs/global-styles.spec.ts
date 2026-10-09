import { test, expect } from '@wordpress/e2e-test-utils-playwright';

type PaletteColor = { slug: string; name: string; color: string };

test.describe( 'global styles', () => {
	test.afterEach( async ( { requestUtils } ) => {
		await requestUtils.resetThemeGlobalStyles();
	} );

	test( 'a palette colour edited in Styles changes the front end', async ( {
		page,
		requestUtils,
	} ) => {
		const theme = await requestUtils.rest< {
			settings: { color: { palette: { theme: PaletteColor[] } } };
		} >( { path: '/wp/v2/global-styles/themes/tekseries' } );
		const palette = theme.settings.color.palette.theme;
		expect( palette.map( ( c ) => c.slug ) ).toEqual(
			expect.arrayContaining( [ 'plum', 'saffron', 'coral-text' ] )
		);

		// Save a user variation, as the Styles panel does.
		const id = await requestUtils.getCurrentThemeGlobalStylesPostId();
		await requestUtils.rest( {
			method: 'POST',
			path: `/wp/v2/global-styles/${ id }`,
			data: {
				settings: {
					color: {
						palette: {
							theme: palette.map( ( c ) =>
								c.slug === 'plum'
									? { ...c, color: '#123456' }
									: c
							),
						},
					},
				},
			},
		} );

		await page.goto( '/' );
		const plum = await page.evaluate( () =>
			getComputedStyle( document.body )
				.getPropertyValue( '--wp--preset--color--plum' )
				.trim()
		);
		expect( plum.toLowerCase() ).toBe( '#123456' );
	} );
} );
