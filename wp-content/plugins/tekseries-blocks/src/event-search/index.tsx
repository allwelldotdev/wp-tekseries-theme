import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit, { type Attributes } from './edit';
import metadata from './block.json';
import './style.scss';

// Dynamic block: render.php builds the form and the results line.
registerBlockType( metadata as BlockConfiguration< Attributes >, {
	edit: Edit,
	save: () => null,
} );
