import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'self-hosted fonts', () => {
	test( 'load from the theme, never from Google Fonts', async ( {
		page,
	} ) => {
		const fontRequests: string[] = [];
		page.on( 'request', ( request ) => {
			if ( request.resourceType() === 'font' ) {
				fontRequests.push( request.url() );
			}
		} );

		await page.goto( '/' );
		const loaded = await page.evaluate( async () => {
			await document.fonts.load( '800 1em "Schibsted Grotesk"' );
			await document.fonts.load( '400 1em Onest' );
			return Array.from( document.fonts )
				.filter( ( face ) => face.status === 'loaded' )
				.map( ( face ) => face.family.replace( /"/g, '' ) );
		} );

		expect( loaded ).toEqual(
			expect.arrayContaining( [ 'Schibsted Grotesk', 'Onest' ] )
		);
		expect( fontRequests.length ).toBeGreaterThan( 0 );

		// The Latin file of each family is asked for early, so the first
		// paint is already set in them.
		const preloaded = await page
			.locator( 'link[rel="preload"][as="font"]' )
			.evaluateAll( ( links ) =>
				links.map( ( link ) => link.getAttribute( 'href' ) )
			);
		expect( preloaded ).toEqual( [
			expect.stringMatching(
				/\/schibsted-grotesk-latin-wght-normal\.woff2$/
			),
			expect.stringMatching( /\/onest-latin-wght-normal\.woff2$/ ),
		] );
		expect( fontRequests ).toEqual( expect.arrayContaining( preloaded ) );
		for ( const url of fontRequests ) {
			expect( url ).toContain( '/themes/tekseries/assets/fonts/' );
		}
	} );
} );
