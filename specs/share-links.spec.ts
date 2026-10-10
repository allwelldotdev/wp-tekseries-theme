import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { invalidBlocks } from './utils/blocks';

type Linked = { id: number; link: string };

test.describe( 'Share Links block', () => {
	const posts: number[] = [];

	test.afterAll( async ( { requestUtils } ) => {
		for ( const id of posts ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/posts/${ id }`,
				params: { force: true },
			} );
		}
	} );

	test( 'shares the current post from the news template, with JavaScript off', async ( {
		browser,
		requestUtils,
	} ) => {
		const post = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/posts',
			data: {
				title: 'E2E Share and Tell',
				status: 'publish',
				content: 'Share test.',
			},
		} );
		posts.push( post.id );
		const url = encodeURIComponent( post.link );

		const context = await browser.newContext( {
			javaScriptEnabled: false,
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		await page.goto( post.link );

		const row = page.locator( '.ts-share-row' );
		await expect( row ).toContainText( 'Share this story' );
		const links = row.locator( '.wp-block-tekseries-share-links a' );
		await expect( links ).toHaveCount( 3 );
		await expect(
			row.getByRole( 'link', { name: 'Share on LinkedIn' } )
		).toHaveAttribute(
			'href',
			`https://www.linkedin.com/sharing/share-offsite/?url=${ url }`
		);
		await expect(
			row.getByRole( 'link', { name: 'Share on Facebook' } )
		).toHaveAttribute(
			'href',
			`https://www.facebook.com/sharer/sharer.php?u=${ url }`
		);
		const whatsapp = row.getByRole( 'link', { name: 'Share on WhatsApp' } );
		await expect( whatsapp ).toHaveAttribute(
			'href',
			`https://wa.me/?text=${ encodeURIComponent(
				`E2E Share and Tell ${ post.link }`
			) }`
		);
		await expect( whatsapp ).toHaveAttribute( 'target', '_blank' );
		await expect( links.locator( 'svg' ) ).toHaveCount( 3 );
		await context.close();
	} );

	test( 'offers the services the editor picked', async ( {
		page,
		requestUtils,
	} ) => {
		const post = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/posts',
			data: {
				title: 'E2E Share Services',
				status: 'publish',
				content:
					'<!-- wp:tekseries/share-links {"services":["x","link"],"className":"is-style-dark"} /-->',
			},
		} );
		posts.push( post.id );

		await page.goto( post.link );
		const block = page.locator(
			'.wp-block-post-content .wp-block-tekseries-share-links'
		);
		await expect( block ).toHaveClass( /\bis-style-dark\b/ );
		await expect( block.locator( 'a' ) ).toHaveCount( 2 );
		await expect(
			block.getByRole( 'link', { name: 'Share on X' } )
		).toHaveAttribute(
			'href',
			`https://x.com/intent/tweet?url=${ encodeURIComponent(
				post.link
			) }&text=E2E%20Share%20Services`
		);
		const permalink = block.getByRole( 'link', {
			name: 'Link to this page',
		} );
		await expect( permalink ).toHaveAttribute( 'href', post.link );
		await expect( permalink ).not.toHaveAttribute( 'target', /.*/ );
	} );

	test( 'copies the link to the page, and loads its script only for that', async ( {
		browser,
		requestUtils,
	} ) => {
		const publish = ( title: string, content: string ) =>
			requestUtils.rest< Linked >( {
				method: 'POST',
				path: '/wp/v2/posts',
				data: { title, status: 'publish', content },
			} );
		const plain = await publish( 'E2E Share Plain', 'Nothing to copy.' );
		const copying = await publish(
			'E2E Share Copy',
			'<!-- wp:tekseries/share-links {"services":["x","link"]} /-->'
		);
		posts.push( plain.id, copying.id );

		const context = await browser.newContext( {
			storageState: { cookies: [], origins: [] },
			permissions: [ 'clipboard-read', 'clipboard-write' ],
		} );
		const page = await context.newPage();
		const scripts: string[] = [];
		page.on( 'request', ( request ) => scripts.push( request.url() ) );
		const ours = () =>
			scripts.filter( ( url ) =>
				/tekseries-blocks\/build\/.*\.js/.test( url )
			);

		// The news template's own share links have nothing to run.
		await page.goto( plain.link );
		await expect( page.locator( '.ts-share-row a' ) ).toHaveCount( 3 );
		expect( ours() ).toEqual( [] );

		await page.goto( copying.link );
		const block = page.locator(
			'.wp-block-post-content .wp-block-tekseries-share-links'
		);
		const note = block.getByRole( 'status' );
		await expect( note ).toHaveText( '' );
		// With the script in, the link says what it now does.
		await block
			.getByRole( 'link', { name: 'Copy the link to this page' } )
			.click();
		await expect( note ).toHaveText( 'Link copied' );
		expect(
			await page.evaluate( () => navigator.clipboard.readText() )
		).toBe( copying.link );
		await expect( page ).toHaveURL( copying.link );
		await expect( note ).toHaveText( '', { timeout: 6000 } );

		expect( ours() ).toEqual( [
			expect.stringContaining( '/build/share-links/view.js' ),
		] );
		expect(
			scripts.filter( ( url ) => /react|jquery/i.test( url ) )
		).toEqual( [] );
		await context.close();
	} );

	test( 'is insertable and valid in the post editor', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( { name: 'tekseries/share-links' } );
		await expect(
			editor.canvas.locator( '.wp-block-tekseries-share-links' ).first()
		).toBeVisible();
		expect( await invalidBlocks( page ) ).toEqual( [] );
	} );
} );
