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
} );
