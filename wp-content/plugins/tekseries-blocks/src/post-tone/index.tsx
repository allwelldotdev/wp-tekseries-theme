import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';

import Edit from './edit';
import metadata from './block.json';

// Dynamic block: render.php builds the wrapper, so save keeps only the inner blocks.
registerBlockType( metadata as BlockConfiguration, {
	edit: Edit,
	save: () => <InnerBlocks.Content />,
} );
