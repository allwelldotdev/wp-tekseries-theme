import { test, expect } from '@wordpress/e2e-test-utils-playwright';

type Toned = { meta: { tekseries_tone: string; tekseries_icon: string } };

// The "Tone and icon" panel in the post sidebar edits the post's meta.
test.describe( 'Tone and icon panel', () => {
	test.afterAll( async ( { requestUtils } ) => {
		const events = await requestUtils.rest< { id: number }[] >( {
			path: '/wp/v2/event',
			params: { status: 'draft,publish', search: 'E2E Panel' },
		} );
		for ( const { id } of events ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/event/${ id }`,
				params: { force: true },
			} );
		}
	} );

	test( 'sets the tone and icon of an event', async ( {
		admin,
		editor,
		page,
		requestUtils,
	} ) => {
		await admin.createNewPost( {
			postType: 'event',
			title: 'E2E Panel Event',
		} );
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'button', { name: 'Tone and icon' } )
			.click();

		const panel = page.locator( '.tekseries-post-tone-panel' );
		await panel.getByRole( 'option', { name: 'Ink' } ).click();
		await panel
			.getByRole( 'button', { name: 'Rocket', exact: true } )
			.click();
		await expect(
			panel.getByRole( 'button', { name: 'Rocket', exact: true } )
		).toHaveAttribute( 'aria-pressed', 'true' );
		await editor.saveDraft();

		const id = await page.evaluate( () => {
			const { wp } = window as unknown as {
				wp: {
					data: {
						select: ( store: string ) => {
							getCurrentPostId: () => number;
						};
					};
				};
			};
			return wp.data.select( 'core/editor' ).getCurrentPostId();
		} );
		const { meta } = await requestUtils.rest< Toned >( {
			path: `/wp/v2/event/${ id }`,
			params: { context: 'edit' },
		} );
		expect( meta ).toMatchObject( {
			tekseries_tone: 'ink',
			tekseries_icon: 'rocket_launch',
		} );
	} );

	test( 'is not offered on pages', async ( { admin, editor, page } ) => {
		await admin.createNewPost( { postType: 'page' } );
		// New pages open the theme's starter patterns first.
		await page
			.getByRole( 'dialog', { name: 'Choose a pattern' } )
			.getByRole( 'button', { name: 'Close' } )
			.click();
		await editor.openDocumentSettingsSidebar();
		// The sidebar has rendered once the featured image control shows.
		await expect(
			page
				.getByRole( 'region', { name: 'Editor settings' } )
				.getByRole( 'button', { name: /Set featured image/ } )
		).toBeVisible();
		await expect(
			page.getByRole( 'button', { name: 'Tone and icon' } )
		).toHaveCount( 0 );
	} );
} );
