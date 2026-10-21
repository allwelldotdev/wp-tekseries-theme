import {
	test,
	expect,
	type RequestUtils,
} from '@wordpress/e2e-test-utils-playwright';
import { invalidBlocks } from './utils/blocks';

type Linked = { id: number; link: string };

const VISITOR = { storageState: { cookies: [], origins: [] } };

// A paragraph connected to the page's deadline, with its own text kept for
// a page without one.
const bound = ( args: string, text: string ) =>
	`<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"tekseries/page-deadline","args":${ args }}}}} --><p>${ text }</p><!-- /wp:paragraph -->`;

const CONTENT =
	bound( '{"format":"datetime"}', 'Fallback date and time' ) +
	bound( '{"format":"date","after":"."}', 'Fallback date' ) +
	bound( '{"format":"time"}', 'Fallback time' );

// Text connected to the `tekseries/page-deadline` binding source: it writes the
// page's deadline in the page's time zone (includes/deadline.php).
test.describe( 'deadline date text', () => {
	const made: number[] = [];

	test.afterAll( async ( { requestUtils } ) => {
		for ( const id of made ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/pages/${ id }`,
				params: { force: true },
			} );
		}
	} );

	const publish = async (
		requestUtils: RequestUtils,
		title: string,
		meta: Record< string, string >
	) => {
		const page = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: { title, status: 'publish', content: CONTENT, meta },
		} );
		made.push( page.id );
		return page;
	};

	test( 'writes the deadline in the page’s time zone', async ( {
		browser,
		requestUtils,
	} ) => {
		const lagos = await publish( requestUtils, 'E2E Date Text Lagos', {
			tekseries_deadline: '2099-12-01T23:59:59',
		} );
		const london = await publish( requestUtils, 'E2E Date Text London', {
			tekseries_deadline: '2099-07-01T09:05:00',
			tekseries_deadline_timezone: 'Europe/London',
		} );
		const context = await browser.newContext( VISITOR );
		const visitor = await context.newPage();

		await visitor.goto( lagos.link );
		for ( const text of [
			'December 1, 2099, 11:59 PM WAT',
			'December 1, 2099.',
			'11:59 PM WAT',
		] ) {
			await expect(
				visitor.getByText( text, { exact: true } )
			).toBeVisible();
		}

		await visitor.goto( london.link );
		for ( const text of [
			'July 1, 2099, 9:05 AM BST',
			'July 1, 2099.',
			'9:05 AM BST',
		] ) {
			await expect(
				visitor.getByText( text, { exact: true } )
			).toBeVisible();
		}
		await context.close();
	} );

	test( 'keeps its own text on a page without a deadline', async ( {
		browser,
		requestUtils,
	} ) => {
		const plain = await publish( requestUtils, 'E2E Date Text None', {} );
		const context = await browser.newContext( VISITOR );
		const visitor = await context.newPage();
		await visitor.goto( plain.link );
		await expect(
			visitor.getByText( 'Fallback date and time', { exact: true } )
		).toBeVisible();
		await expect(
			visitor.getByText( 'Fallback date', { exact: true } )
		).toBeVisible();
		await context.close();
	} );

	test( 'an editor connects a paragraph and sees it follow the deadline', async ( {
		admin,
		editor,
		page,
		requestUtils,
	} ) => {
		const draft = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Date Text Editor',
				status: 'draft',
				content:
					'<!-- wp:paragraph --><p>Closing day</p><!-- /wp:paragraph -->',
				meta: { tekseries_deadline: '2099-12-01T23:59:59' },
			},
		} );
		made.push( draft.id );
		await admin.editPost( draft.id );
		await editor.openDocumentSettingsSidebar();
		await editor.canvas.getByText( 'Closing day' ).click();

		// Attributes › Show content › content › Page deadline › the date. The
		// list shows each field's text as it stands.
		const settings = page.getByRole( 'region', {
			name: 'Editor settings',
		} );
		await settings
			.getByRole( 'button', { name: 'Attributes options' } )
			.click();
		await page
			.getByRole( 'menuitemcheckbox', { name: 'Show content' } )
			.click();
		await page.keyboard.press( 'Escape' );
		await settings
			.getByRole( 'button', { name: /^content Not connected/ } )
			.click();
		await page.getByRole( 'menuitem', { name: 'Page deadline' } ).click();
		await page
			.getByRole( 'menuitemcheckbox', {
				name: 'Deadline: date December 1, 2099',
			} )
			.click();
		const paragraph = editor.canvas.getByRole( 'document', {
			name: 'Block: Paragraph',
		} );
		await expect( paragraph ).toHaveText( 'December 1, 2099' );

		// The text follows the deadline as it is changed in the editor.
		await page.evaluate( () =>
			(
				window as unknown as {
					wp: {
						data: {
							dispatch: ( store: string ) => {
								editPost: ( edits: object ) => void;
							};
						};
					};
				}
			 ).wp.data
				.dispatch( 'core/editor' )
				.editPost( {
					meta: {
						tekseries_deadline: '2099-11-15T10:00:00',
						tekseries_deadline_timezone: '',
					},
				} )
		);
		await expect( paragraph ).toHaveText( 'November 15, 2099' );
		expect( await invalidBlocks( page ) ).toEqual( [] );
		expect( await editor.getBlocks() ).toMatchObject( [
			{
				name: 'core/paragraph',
				attributes: {
					metadata: {
						bindings: {
							content: {
								source: 'tekseries/page-deadline',
								args: { format: 'date' },
							},
						},
					},
				},
			},
		] );
	} );
} );
