import type { Page } from '@playwright/test';
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { invalidBlocks } from './utils/blocks';

type Linked = { id: number; link: string };

const PARAGRAPH =
	'<!-- wp:paragraph --><p>E2E open text</p><!-- /wp:paragraph -->';
const BUTTON =
	'<!-- wp:buttons --><div class="wp-block-buttons"><!-- wp:button -->' +
	'<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://example.com">Apply now</a></div>' +
	'<!-- /wp:button --></div><!-- /wp:buttons -->';

const VISITOR = { storageState: { cookies: [], origins: [] } };

// The blocks' Deadline panel: when visitors see a block, and the disabled
// "Applications closed" button. It writes the classes the server reads
// (ts-when-open, ts-when-closed, ts-disabled; includes/deadline.php).
test.describe( 'deadline panel', () => {
	const made: number[] = [];

	test.afterAll( async ( { requestUtils } ) => {
		for ( const id of made ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/${
					id < 0 ? 'posts' : 'pages'
				}/${ Math.abs( id ) }`,
				params: { force: true },
			} );
		}
	} );

	const settings = ( page: Page ) =>
		page.getByRole( 'region', { name: 'Editor settings' } );

	test( 'sets when a block shows and adds the closed button', async ( {
		admin,
		editor,
		page,
		requestUtils,
		browser,
	} ) => {
		const post = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Deadline Panel',
				status: 'publish',
				content: PARAGRAPH + BUTTON,
				meta: { tekseries_deadline: '2000-01-01T00:00:00' },
			},
		} );
		made.push( post.id );
		await admin.editPost( post.id );
		await editor.openDocumentSettingsSidebar();

		// A paragraph shown only before the deadline, then its copy for after.
		await editor.canvas.getByText( 'E2E open text' ).click();
		await settings( page )
			.getByRole( 'radio', { name: 'Before the deadline' } )
			.check();
		await settings( page )
			.getByRole( 'button', {
				name: 'Add a copy to show after the deadline',
			} )
			.click();

		// The Apply button only before; then the closed button after it.
		await editor.canvas
			.getByRole( 'document', { name: 'Block: Button', exact: true } )
			.click();
		await settings( page )
			.getByRole( 'radio', { name: 'Before the deadline' } )
			.check();
		await settings( page )
			.getByRole( 'button', {
				name: 'Add the closed button after it',
			} )
			.click();

		const blocks = await editor.getBlocks();
		expect( blocks ).toMatchObject( [
			{
				name: 'core/paragraph',
				attributes: { className: 'ts-when-open' },
			},
			{
				name: 'core/paragraph',
				attributes: {
					className: 'ts-when-closed',
				},
			},
			{
				name: 'core/buttons',
				innerBlocks: [
					{
						attributes: {
							className: 'ts-when-open',
							url: 'https://example.com',
						},
					},
					{
						attributes: {
							tagName: 'button',
							text: 'Applications closed',
							className:
								'ts-icon-lock ts-disabled ts-when-closed',
						},
					},
				],
			},
		] );
		expect( await invalidBlocks( page ) ).toEqual( [] );

		await page
			.getByRole( 'region', { name: 'Editor top bar' } )
			.getByRole( 'button', { name: 'Save', exact: true } )
			.click();
		await expect(
			page
				.getByRole( 'button', { name: 'Dismiss this notice' } )
				.filter( { hasText: /updated/i } )
		).toBeVisible();

		// The deadline has passed: visitors get the closed page.
		const context = await browser.newContext( VISITOR );
		const visitor = await context.newPage();
		await visitor.goto( post.link );
		await expect( visitor.getByText( 'E2E open text' ) ).toBeVisible();
		await expect( visitor.locator( '.ts-when-open' ) ).toHaveCount( 0 );
		await expect(
			visitor.getByRole( 'link', { name: 'Apply now' } )
		).toHaveCount( 0 );
		await expect(
			visitor.getByRole( 'button', { name: 'Applications closed' } )
		).toBeDisabled();
		await context.close();
	} );

	test( 'turns a Button into the closed button and back', async ( {
		admin,
		editor,
		page,
		requestUtils,
	} ) => {
		const post = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Closed Button',
				status: 'draft',
				content: BUTTON,
				meta: { tekseries_deadline: '2099-12-01T23:59:59' },
			},
		} );
		made.push( post.id );
		await admin.editPost( post.id );
		await editor.openDocumentSettingsSidebar();
		await editor.canvas
			.getByRole( 'document', { name: 'Block: Button', exact: true } )
			.click();
		const toggle = settings( page ).getByRole( 'checkbox', {
			name: 'Applications closed button (disabled)',
		} );
		const button = async () =>
			( await editor.getBlocks() )[ 0 ]?.innerBlocks[ 0 ]?.attributes;

		await toggle.check();
		expect( await button() ).toMatchObject( {
			tagName: 'button',
			className: 'ts-icon-lock ts-disabled',
		} );
		expect( ( await button() )?.url ).toBeUndefined();
		expect( await editor.getEditedPostContent() ).toContain(
			'<button type="button" class="wp-block-button__link wp-element-button">Apply now</button>'
		);

		await toggle.uncheck();
		expect( ( await button() )?.tagName ).toBeUndefined();
		expect( ( await button() )?.className ).toBe( 'ts-icon-lock' );
		expect( await invalidBlocks( page ) ).toEqual( [] );
	} );

	test( 'shows only on pages that have a deadline', async ( {
		admin,
		editor,
		page,
		requestUtils,
	} ) => {
		const settingsHas = async () =>
			settings( page )
				.getByRole( 'button', { name: 'Deadline', exact: true } )
				.count();

		const plain = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E No Deadline',
				status: 'draft',
				content: PARAGRAPH,
			},
		} );
		made.push( plain.id );
		await admin.editPost( plain.id );
		await editor.openDocumentSettingsSidebar();
		await editor.canvas.getByText( 'E2E open text' ).click();
		expect( await settingsHas() ).toBe( 0 );

		const post = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/posts',
			data: {
				title: 'E2E Deadline Post',
				status: 'draft',
				content: PARAGRAPH,
			},
		} );
		made.push( -post.id );
		await admin.editPost( post.id );
		await editor.openDocumentSettingsSidebar();
		await editor.canvas.getByText( 'E2E open text' ).click();
		expect( await settingsHas() ).toBe( 0 );
	} );
} );
