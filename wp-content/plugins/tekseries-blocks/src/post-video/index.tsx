import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './block.json';
import './style.scss';

// Dynamic block: render.php prints the card.
registerBlockType( metadata as BlockConfiguration, {
	edit: Edit,
	save: () => null,
} );
