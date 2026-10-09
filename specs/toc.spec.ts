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
				content: SECTIONS,
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
		await context.close();
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
