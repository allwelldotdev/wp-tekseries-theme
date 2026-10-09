import { test, expect } from '@wordpress/e2e-test-utils-playwright';

type Pattern = { name: string; content: string };
type Focus = { label: string; outline: string };

// Tabbing through the home page reaches every link and button in the main
// region, and each one shows a visible focus ring.
test.describe( 'keyboard', () => {
	test( 'every focusable element on the home page shows a focus ring', async ( {
		page,
		requestUtils,
	} ) => {
		const patterns = await requestUtils.rest< Pattern[] >( {
			path: '/wp/v2/block-patterns/patterns',
		} );
		const home = await requestUtils.createPage( {
			title: 'E2E Home',
			status: 'publish',
			content: patterns
				.filter( ( pattern ) =>
					pattern.name.startsWith( 'tekseries/home-' )
				)
				.map( ( pattern ) => pattern.content )
				.join( '\n' ),
		} );

		await page.setViewportSize( { width: 1440, height: 900 } );
		await page.goto( `/?page_id=${ home.id }` );
		const focusable = await page
			.locator( 'main a[href], main button' )
			.filter( { visible: true } )
			.count();
		expect( focusable ).toBeGreaterThan( 5 );

		// Tab past the header, through main and into the footer, recording
		// each focused element inside main.
		const seen: Focus[] = [];
		for ( let i = 0; i < focusable + 20; i++ ) {
			await page.keyboard.press( 'Tab' );
			seen.push(
				...( await page.evaluate( () =>
					Array.from(
						document.querySelectorAll< HTMLElement >(
							'main :focus'
						),
						( el ) => {
							const style = getComputedStyle( el );
							return {
								label: el.innerText.trim(),
								outline: `${ style.outlineStyle } ${ style.outlineWidth }`,
							};
						}
					)
				) )
			);
		}

		expect( seen ).toHaveLength( focusable );
		expect(
			seen.filter( ( focus ) => /^none|\s0px$/.test( focus.outline ) )
		).toEqual( [] );
		await requestUtils.deleteAllPages();
	} );
} );
