import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { invalidBlocks } from './utils/blocks';

type Pattern = { name: string; content: string };

test.describe( 'theme patterns', () => {
	test( 'every tekseries pattern loads in the page editor with valid blocks', async ( {
		admin,
		page,
		requestUtils,
	} ) => {
		const patterns = (
			await requestUtils.rest< Pattern[] >( {
				path: '/wp/v2/block-patterns/patterns',
			} )
		).filter( ( pattern ) => pattern.name.startsWith( 'tekseries/' ) );
		expect( patterns.length ).toBeGreaterThan( 5 );

		await admin.createNewPost( { postType: 'page' } );
		for ( const { name, content } of patterns ) {
			await page.evaluate( ( markup ) => {
				const { wp } = window as unknown as {
					wp: {
						blocks: { parse: ( html: string ) => unknown[] };
						data: {
							dispatch: ( store: string ) => {
								resetBlocks: ( blocks: unknown[] ) => void;
							};
						};
					};
				};
				wp.data
					.dispatch( 'core/block-editor' )
					.resetBlocks( wp.blocks.parse( markup ) );
			}, content );
			expect( { [ name ]: await invalidBlocks( page ) } ).toEqual( {
				[ name ]: [],
			} );
		}
	} );
} );
