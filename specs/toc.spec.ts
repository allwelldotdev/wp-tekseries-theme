import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { invalidBlocks } from './utils/blocks';

type Linked = { id: number; link: string };

const heading = ( text: string, anchor?: string ) =>
	`<!-- wp:heading${ anchor ? ` {"anchor":"${ anchor }"}` : '' } -->` +
	`<h2 class="wp-block-heading"${
		anchor ? ` id="${ anchor }"` : ''
	}>${ text }</h2><!-- /wp:heading -->` +
	`<!-- wp:paragraph --><p>About ${ text }.</p><!-- /wp:paragraph -->`;

const SECTIONS =
	heading( 'Purpose', 'purpose' ) +
	heading( 'No anchor here' ) +
	heading( 'Data &amp; Cookies', 'cookies' );

test.describe( 'Table of Contents block', () => {
	const pages: number[] = [];

	test.afterAll( async ( { requestUtils } ) => {
		for ( const id of pages ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/pages/${ id }`,
				params: { force: true },
			} );
		}
	} );

	test( 'the legal template lists the anchored H2 headings, with JavaScript off', async ( {
		browser,
		requestUtils,
	} ) => {
		const legal = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Legal',
				status: 'publish',
				template: 'page-legal',
				content:
					SECTIONS +
					'<!-- wp:pattern {"slug":"tekseries/legal-cross-link"} /-->',
			},
		} );
		pages.push( legal.id );

		const context = await browser.newContext( {
			javaScriptEnabled: false,
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		await page.goto( legal.link );

		const toc = page.getByRole( 'navigation', { name: 'On this page' } );
		await expect( toc.locator( 'details' ) ).toHaveAttribute( 'open', '' );
		const links = toc.getByRole( 'link' );
		await expect( links ).toHaveText( [ '01Purpose', '02Data & Cookies' ] );
		await expect( links.first() ).toHaveAttribute( 'href', '#purpose' );
		await expect( links.last() ).toHaveAttribute( 'href', '#cookies' );
		// The band that closes the page titles itself with a paragraph, so
		// it is not listed.
		await expect(
			page.getByText( 'Read our Terms and Conditions' )
		).toBeVisible();
		await expect(
			page.getByRole( 'link', { name: 'Terms and Conditions' } ).last()
		).toHaveAttribute( 'href', '/terms/' );
		// The heading row is a 44px target, padding included.
		const summary = await toc.locator( 'summary' ).boundingBox();
		expect( summary?.height ).toBe( 44 );
		await context.close();
	} );

	// With JavaScript: the mark on the section being read, and the phone fold.
	test( 'marks the section being read and starts folded on phones', async ( {
		browser,
		requestUtils,
	} ) => {
		// Tall enough to scroll from one section to the next.
		const filler =
			'<!-- wp:spacer {"height":"1400px"} --><div style="height:1400px" aria-hidden="true" class="wp-block-spacer"></div><!-- /wp:spacer -->';
		const long = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Legal Long',
				status: 'publish',
				template: 'page-legal',
				content:
					heading( 'Purpose', 'purpose' ) +
					filler +
					heading( 'Cookies', 'cookies' ) +
					filler +
					heading( 'Contact', 'contact' ),
			},
		} );
		pages.push( long.id );

		const visitor = { storageState: { cookies: [], origins: [] } };
		const desktop = await browser.newContext( visitor );
		let page = await desktop.newPage();
		const scripts: string[] = [];
		page.on( 'request', ( request ) => scripts.push( request.url() ) );
		await page.goto( long.link );
		let toc = page.getByRole( 'navigation', { name: 'On this page' } );
		const link = ( name: string ) => toc.getByRole( 'link', { name } );
		await expect( toc.locator( 'details' ) ).toHaveAttribute( 'open', '' );

		// Scrolling to a section marks its link, and only that one.
		await page
			.locator( '#cookies' )
			.evaluate( ( section ) => section.scrollIntoView() );
		await expect( link( 'Cookies' ) ).toHaveAttribute(
			'aria-current',
			'true'
		);
		await expect( toc.locator( '[aria-current="true"]' ) ).toHaveCount( 1 );

		// The last section can't reach the top of the screen; picking its
		// link marks it all the same.
		await link( 'Contact' ).click();
		await expect( page ).toHaveURL( /#contact$/ );
		await expect( link( 'Contact' ) ).toHaveAttribute(
			'aria-current',
			'true'
		);
		await expect( link( 'Cookies' ) ).toHaveAttribute(
			'aria-current',
			'false'
		);
		expect(
			scripts.filter( ( url ) => /react|jquery/i.test( url ) )
		).toEqual( [] );
		await desktop.close();

		// A phone: folded on arrival, opened by its summary.
		const phone = await browser.newContext( {
			...visitor,
			viewport: { width: 390, height: 844 },
		} );
		page = await phone.newPage();
		await page.goto( long.link );
		toc = page.getByRole( 'navigation', { name: 'On this page' } );
		await expect( toc.locator( 'details' ) ).toHaveClass( /\bis-ready\b/ );
		await expect( toc.locator( 'details' ) ).not.toHaveAttribute( 'open' );
		await expect( toc.getByRole( 'link' ).first() ).toBeHidden();
		await toc.locator( 'summary' ).click();
		await expect( toc.getByRole( 'link' ) ).toHaveText( [
			'01Purpose',
			'02Cookies',
			'03Contact',
		] );
		await expect( toc.getByRole( 'link' ).first() ).toBeVisible();
		await phone.close();

		// The same phone without JavaScript keeps the list open and in view.
		const plain = await browser.newContext( {
			...visitor,
			javaScriptEnabled: false,
			viewport: { width: 390, height: 844 },
		} );
		page = await plain.newPage();
		await page.goto( long.link );
		toc = page.getByRole( 'navigation', { name: 'On this page' } );
		await expect( toc.locator( 'details' ) ).toHaveAttribute( 'open', '' );
		await expect( toc.getByRole( 'link' ).first() ).toBeVisible();
		await plain.close();
	} );

	test( 'renders nothing when no heading has an anchor', async ( {
		page,
		requestUtils,
	} ) => {
		const plain = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E No Anchors',
				status: 'publish',
				content: '<!-- wp:tekseries/toc /-->' + heading( 'Plain' ),
			},
		} );
		pages.push( plain.id );

		await page.goto( plain.link );
		await expect( page.locator( '.wp-block-tekseries-toc' ) ).toHaveCount(
			0
		);
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
		await editor.insertBlock( { name: 'tekseries/toc' } );
		// A new page has no saved headings yet, so the block explains itself.
		await expect(
			editor.canvas.getByText( 'Lists the headings (H2)' )
		).toBeVisible();
		expect( await invalidBlocks( page ) ).toEqual( [] );
	} );
} );
