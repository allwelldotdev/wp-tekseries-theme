import { readdirSync } from 'node:fs';
import path from 'node:path';
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { invalidBlocks } from './utils/blocks';

const templates = readdirSync(
	path.join( __dirname, '../wp-content/themes/tekseries/templates' )
).map( ( file ) => path.basename( file, '.html' ) );

test.describe( 'site editor', () => {
	for ( const slug of templates ) {
		test( `opens the ${ slug } template with valid blocks`, async ( {
			admin,
			editor,
			page,
		} ) => {
			await admin.visitSiteEditor( {
				postId: `tekseries//${ slug }`,
				postType: 'wp_template',
				canvas: 'edit',
			} );
			await expect( editor.canvas.locator( '.ts-header' ) ).toBeVisible();
			await expect(
				editor.canvas.locator( '.ts-footer__panel' )
			).toBeVisible();

			// Every block, including template part and pattern content, must
			// parse as valid.
			expect( await invalidBlocks( page ) ).toEqual( [] );
		} );
	}
} );
