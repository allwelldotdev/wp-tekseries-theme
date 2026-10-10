import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';

import Edit, { type Attributes } from './edit';
import metadata from './block.json';
import './style.scss';

// Dynamic block: render.php builds the track and dots, so save keeps only the slides.
registerBlockType( metadata as BlockConfiguration< Attributes >, {
	edit: Edit,
	save: () => <InnerBlocks.Content />,
} );
