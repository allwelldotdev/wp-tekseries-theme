import path from 'node:path';
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

// The theme's stacked logo, 218 by 150: any picture will do as a site logo.
const LOGO = path.join(
	__dirname,
	'../wp-content/themes/tekseries/assets/images/logo-stacked.png'
);

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

	// Desktop starts above 1100px: there the logo, the seven links and both
	// actions share one row, and the logo keeps its width (1.18.1).
	test( 'keeps the logo, menu and actions on one row on every desktop width', async ( {
		page,
		requestUtils,
	} ) => {
		const logo = await requestUtils.uploadMedia( LOGO );
		const setLogo = ( id: number ) =>
			requestUtils.rest( {
				method: 'POST',
				path: '/wp/v2/settings',
				data: { site_logo: id },
			} );
		await setLogo( logo.id );

		try {
			for ( const width of [ 1101, 1180, 1279, 1440 ] ) {
				await page.setViewportSize( { width, height: 900 } );
				await page.goto( '/' );
				// As wide as the live logo: 244 by 60, shown 44px high.
				await page.addStyleTag( {
					content:
						'.ts-header .wp-block-site-logo img { width: 179px; }',
				} );

				const banner = page.getByRole( 'banner' );
				const main = page.getByRole( 'navigation', { name: 'Main' } );
				const parts = [
					banner.locator( '.wp-block-site-logo' ),
					...MAIN_LINKS.map( ( label ) =>
						main.getByRole( 'link', { name: label, exact: true } )
					),
					banner.getByRole( 'link', { name: 'Job Series' } ),
					banner.getByRole( 'link', { name: 'Post A Job' } ),
				];
				const centres: number[] = [];
				for ( const part of parts ) {
					const box = await part.boundingBox();
					expect( box ).not.toBeNull();
					centres.push( box!.y + box!.height / 2 );
				}
				for ( const centre of centres ) {
					expect( Math.abs( centre - centres[ 0 ]! ) ).toBeLessThan(
						3
					);
				}
				const logoBox = await parts[ 0 ]!.boundingBox();
				expect( logoBox!.width ).toBeGreaterThanOrEqual( 178.5 );
			}
		} finally {
			await setLogo( 0 );
			await requestUtils.deleteMedia( logo.id );
		}
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
		const running = () =>
			panel.evaluate(
				( element ) =>
					element
						.getAnimations( { subtree: true } )
						.filter( ( { playState } ) => playState === 'running' )
						.length
			);
		await expect.poll( running ).toBe( 0 );
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
		const shown = ( item: Element ) => {
			const style = window.getComputedStyle( item );
			return [ style.opacity, style.translate ];
		};
		await page.keyboard.press( 'Enter' );
		await expect(
			links.first().getByRole( 'link', { name: 'Who We Are' } )
		).toBeFocused();
		expect( await links.first().evaluate( shown ) ).toEqual( [
			'1',
			'none',
		] );
		expect( await links.nth( 1 ).evaluate( name ) ).toBe( 'ts-menu-rise' );

		// And it does not rise in again once the focus has moved on.
		await expect.poll( running ).toBe( 0 );
		await page.keyboard.press( 'Tab' );
		await expect(
			links.nth( 1 ).getByRole( 'link', { name: 'What We Do' } )
		).toBeFocused();
		expect( await running() ).toBe( 0 );
		expect( await links.first().evaluate( shown ) ).toEqual( [
			'1',
			'none',
		] );
	} );
} );

// The header's logo is sized by its height (44px on desktop, 40px on tablets,
// 34px on phones) and takes the width its own proportions give, whatever file
// an editor picks. The footer shows the stacked logo on a white plate.
test.describe( 'logos', () => {
	test( 'the header logo keeps its height and proportions at every width', async ( {
		page,
		requestUtils,
	} ) => {
		const logo = await requestUtils.uploadMedia( LOGO );
		// The settings route, as the utilities' own type has no logo in it.
		const setLogo = ( id: number ) =>
			requestUtils.rest( {
				method: 'POST',
				path: '/wp/v2/settings',
				data: { site_logo: id },
			} );
		await setLogo( logo.id );

		for ( const [ width, height ] of [
			[ 1440, 44 ],
			[ 834, 40 ],
			[ 390, 34 ],
		] as const ) {
			await page.setViewportSize( { width, height: 900 } );
			await page.goto( '/' );
			const box = await page
				.getByRole( 'banner' )
				.locator( '.wp-block-site-logo img' )
				.boundingBox();
			expect( box?.height ).toBe( height );
			expect( box?.width ).toBeCloseTo( ( height * 218 ) / 150, 0 );
		}

		await setLogo( 0 );
		await requestUtils.deleteMedia( logo.id );
	} );

	test( 'the footer shows the stacked logo on a white plate', async ( {
		page,
	} ) => {
		await page.goto( '/' );
		const logo = page
			.getByRole( 'contentinfo' )
			.getByRole( 'img', { name: 'TekSeries' } );
		await logo.scrollIntoViewIfNeeded();
		await expect
			.poll( () =>
				logo.evaluate( ( img: HTMLImageElement ) => img.naturalWidth )
			)
			.toBe( 218 );
		expect( ( await logo.boundingBox() )?.height ).toBe( 44 );
		const plate = page.locator( '.ts-footer__logo' );
		expect( ( await plate.boundingBox() )?.height ).toBe( 56 );
		await expect( plate ).toHaveCSS(
			'background-color',
			'rgb(255, 255, 255)'
		);
	} );
} );

// The legal row under the footer panel (1.16.1): the copyright, the company's
// registration number and the builder's credit, then the legal links. On
// phones each item has its own centred line, as on the mobile board.
test.describe( 'footer legal row', () => {
	test( 'shows the RC number on every page', async ( { page } ) => {
		for ( const url of [ '/', '/?s=tekseries', '/no-such-page/' ] ) {
			await page.goto( url );
			await expect(
				page.getByRole( 'contentinfo' ).getByText( 'RC 9920315.', {
					exact: true,
				} )
			).toBeVisible();
		}
	} );

	test( 'credits Beekomm Technologies with a link to its site', async ( {
		page,
	} ) => {
		await page.goto( '/' );
		await expect(
			page
				.locator( '.ts-footer__legal' )
				.getByRole( 'link', { name: 'Beekomm Technologies' } )
		).toHaveAttribute( 'href', 'https://beekomm.com' );
	} );

	test( 'stacks its items one per line on phones', async ( { page } ) => {
		await page.setViewportSize( { width: 390, height: 844 } );
		await page.goto( '/' );
		const legal = page.locator( '.ts-footer__legal' );
		const items = [
			legal.getByText( /^Copyright © TekSeries \d{4}$/ ),
			legal.getByText( 'RC 9920315.', { exact: true } ),
			legal.getByText( /^Built and maintained by Beekomm Technologies$/ ),
			legal.getByRole( 'navigation', { name: 'Legal' } ),
		];
		const first = await items[ 0 ]!.boundingBox();
		expect( first ).not.toBeNull();
		const centre = first!.x + first!.width / 2;
		let above = first!;
		for ( const item of items.slice( 1 ) ) {
			const box = await item.boundingBox();
			expect( box ).not.toBeNull();
			// Below the item before it, and centred on the same line.
			expect( box!.y ).toBeGreaterThanOrEqual( above.y + above.height );
			expect( Math.abs( box!.x + box!.width / 2 - centre ) ).toBeLessThan(
				2
			);
			above = box!;
		}
	} );
} );
