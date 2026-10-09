import type { Page } from '@playwright/test';

type BlockEditorStore = {
	getClientIdsWithDescendants: () => string[];
	getBlock: ( clientId: string ) => { name: string; isValid: boolean } | null;
};

/**
 * Names of the blocks in the open editor that failed validation, i.e. those
 * the editor would show as "This block contains unexpected or invalid content".
 * @param page The editor page.
 */
export const invalidBlocks = ( page: Page ) =>
	page.evaluate( () => {
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
