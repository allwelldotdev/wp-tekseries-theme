import { test, expect } from '@wordpress/e2e-test-utils-playwright';

type BlockEditorStore = {
	getClientIdsWithDescendants: () => string[];
	getBlock: ( clientId: string ) => { name: string; isValid: boolean } | null;
};

test.describe( 'site editor', () => {
	test( 'opens the index template with valid header and footer blocks', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.visitSiteEditor( {
			postId: 'tekseries//index',
			postType: 'wp_template',
			canvas: 'edit',
		} );

		await expect( editor.canvas.locator( '.ts-header' ) ).toBeVisible();
		await expect(
			editor.canvas.locator( '.ts-footer__panel' )
		).toBeVisible();

		// Every block, including template part and pattern content, must parse
		// as valid, or the editor shows "This block contains unexpected content".
		const invalid = await page.evaluate( () => {
			const { wp } = window as unknown as {
				wp: { data: { select: ( name: string ) => BlockEditorStore } };
			};
			const store = wp.data.select( 'core/block-editor' );
			return store
				.getClientIdsWithDescendants()
				.map( ( clientId ) => store.getBlock( clientId ) )
				.filter( ( block ) => block?.isValid === false )
				.map( ( block ) => block?.name );
		} );
		expect( invalid ).toEqual( [] );
	} );
} );
