import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { invalidBlocks } from './utils/blocks';

type Template = { id: string };

test.describe( 'site editor', () => {
	test( 'opens every theme template with valid blocks', async ( {
		admin,
		editor,
		page,
		requestUtils,
	} ) => {
		const templates = (
			await requestUtils.rest< Template[] >( {
				path: '/wp/v2/templates',
			} )
		).filter( ( template ) => template.id.startsWith( 'tekseries//' ) );
		expect( templates.length ).toBeGreaterThan( 5 );

		for ( const { id } of templates ) {
			await admin.visitSiteEditor( {
				postId: id,
				postType: 'wp_template',
				canvas: 'edit',
			} );
			await expect( editor.canvas.locator( '.ts-header' ) ).toBeVisible();
			await expect(
				editor.canvas.locator( '.ts-footer__panel' )
			).toBeVisible();

			// Every block, including template part and pattern content, must
			// parse as valid.
			expect( { [ id ]: await invalidBlocks( page ) } ).toEqual( {
				[ id ]: [],
			} );
		}
	} );
} );
