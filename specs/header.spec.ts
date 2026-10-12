import { test, expect } from '@wordpress/e2e-test-utils-playwright';

const MAIN_LINKS = [
	'Who We Are',
	'What We Do',
	'News',
	'Events',
	'Gallery',
	'Team',
	'Contact',
];

test.describe( 'header', () => {
	test( 'shows the full menu and actions on desktop', async ( { page } ) => {
		await page.setViewportSize( { width: 1440, height: 900 } );
		await page.goto( '/' );

		const main = page.getByRole( 'navigation', { name: 'Main' } );
		for ( const label of MAIN_LINKS ) {
			await expect(
				main.getByRole( 'link', { name: label, exact: true } )
			).toBeVisible();
		}
		const banner = page.getByRole( 'banner' );
		await expect(
			banner.getByRole( 'link', { name: 'Job Series' } )
		).toBeVisible();
		await expect(
			banner.getByRole( 'link', { name: 'Post A Job' } )
		).toBeVisible();
		await expect(
			page.getByRole( 'button', { name: 'Open menu' } )
		).toBeHidden();
	} );

	test( 'collapses into a menu panel at tablet width', async ( { page } ) => {
		await page.setViewportSize( { width: 834, height: 1000 } );
		await page.goto( '/' );

		await expect(
			page.getByRole( 'navigation', { name: 'Main' } )
		).toBeHidden();
		const open = page.getByRole( 'button', { name: 'Open menu' } );
		await expect( open ).toBeVisible();
		await open.click();

		const menu = page.getByRole( 'navigation', { name: 'Menu' } );
		for ( const label of MAIN_LINKS ) {
			await expect(
				menu.getByRole( 'link', { name: label, exact: true } )
			).toBeVisible();
		}
		await expect(
			menu.getByRole( 'link', { name: 'Post A Job' } )
		).toBeVisible();

		// The close button sits where the menu button was, on top of it.
		const close = page.getByRole( 'button', { name: 'Close menu' } );
		const box = await close.boundingBox();
		expect( box ).not.toBeNull();
		const onTop = await page.evaluate(
			( { x, y } ) =>
				document
					.elementFromPoint( x, y )
					?.closest( 'button' )
					?.getAttribute( 'aria-label' ),
			{
				x: ( box?.x ?? 0 ) + ( box?.width ?? 0 ) / 2,
				y: ( box?.y ?? 0 ) + ( box?.height ?? 0 ) / 2,
			}
		);
		expect( onTop ).toBe( 'Close menu' );

		await close.click();
		await expect( menu.getByRole( 'link', { name: 'News' } ) ).toBeHidden();
		await expect( open ).toBeFocused();
	} );

	test( 'closes the menu panel with Escape', async ( { page } ) => {
		await page.setViewportSize( { width: 390, height: 844 } );
		await page.goto( '/' );

		const open = page.getByRole( 'button', { name: 'Open menu' } );
		await open.click();
		const menu = page.getByRole( 'navigation', { name: 'Menu' } );
		await expect(
			menu.getByRole( 'link', { name: 'News' } )
		).toBeVisible();

		await page.keyboard.press( 'Escape' );
		await expect( menu.getByRole( 'link', { name: 'News' } ) ).toBeHidden();
		await expect( open ).toBeFocused();
	} );

	test( 'opens the menu panel with motion for visitors who accept it', async ( {
		page,
	} ) => {
		// The test config asks for less motion everywhere; this page wants it.
		await page.emulateMedia( { reducedMotion: 'no-preference' } );
		await page.setViewportSize( { width: 390, height: 844 } );
		await page.goto( '/' );
		const name = ( element: Element ) =>
			window.getComputedStyle( element ).animationName;
		const delays = ( items: Element[] ) =>
			items.map( ( item ) =>
				parseFloat(
					window.getComputedStyle( item ).animationDelay
				).toFixed( 2 )
			);

		const open = page.getByRole( 'button', { name: 'Open menu' } );
		const bars = open.locator( 'svg' );
		const close = page.getByRole( 'button', { name: 'Close menu' } );
		const panel = page.locator(
			'.ts-nav-compact .wp-block-navigation__responsive-container'
		);
		const links = panel.locator( '.wp-block-navigation__container > li' );

		// The panel unrolls, the links rise in one after another and the
		// buttons last, and the cross turns into place.
		await open.click();
		expect( await panel.evaluate( name ) ).toBe( 'ts-menu-unroll' );
		expect( await links.evaluateAll( delays ) ).toEqual( [
			'0.06',
			'0.10',
			'0.14',
			'0.18',
			'0.22',
			'0.26',
			'0.30',
		] );
		expect(
			await panel.locator( '.ts-nav-compact__ctas' ).evaluateAll( delays )
		).toEqual( [ '0.34' ] );
		expect( await close.locator( 'svg' ).evaluate( name ) ).toBe(
			'ts-menu-cross'
		);

		// Once it has played, nothing is left clipped or faded.
		await expect
			.poll( () =>
				panel.evaluate(
					( element ) =>
						element
							.getAnimations( { subtree: true } )
							.filter(
								( { playState } ) => playState === 'running'
							).length
				)
			)
			.toBe( 0 );
		expect(
			await panel.evaluate( ( element ) => {
				const style = window.getComputedStyle( element );
				return [ style.clipPath, style.opacity ];
			} )
		).toEqual( [ 'none', '1' ] );
		await expect(
			panel.getByRole( 'link', { name: 'Post A Job' } )
		).toBeVisible();

		// Closing takes the panel away at once, and the bars swing back.
		await close.click();
		await expect( panel ).toBeHidden();
		await expect
			.poll( () =>
				bars.evaluate( ( icon ) => {
					const style = window.getComputedStyle( icon );
					return [ style.rotate, style.opacity ];
				} )
			)
			.toEqual( [ 'none', '1' ] );
		await expect( open ).toBeFocused();

		// From the keyboard, the link the focus lands on is there at once.
		await page.keyboard.press( 'Enter' );
		await expect(
			links.first().getByRole( 'link', { name: 'Who We Are' } )
		).toBeFocused();
		expect( await links.first().evaluate( name ) ).toBe( 'none' );
		expect( await links.nth( 1 ).evaluate( name ) ).toBe( 'ts-menu-rise' );
	} );
} );
