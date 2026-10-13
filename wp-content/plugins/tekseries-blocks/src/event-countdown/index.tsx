import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit, { type Attributes } from './edit';
import metadata from './block.json';
import './style.scss';

// Dynamic block: render.php reads the event's date, so nothing is saved.
registerBlockType( metadata as BlockConfiguration< Attributes >, {
	edit: Edit,
	save: () => null,
} );
