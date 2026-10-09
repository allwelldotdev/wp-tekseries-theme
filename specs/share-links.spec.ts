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
