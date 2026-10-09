import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { Placeholder } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

export type Attributes = Record< string, never >;

const Empty = () => (
	<Placeholder
		icon="list-view"
		label={ __( 'Table of Contents', 'tekseries-blocks' ) }
		instructions={ __(
			'Lists the headings (H2) that have an HTML anchor, once the post is saved. Set an anchor under Advanced in a heading’s settings.',
			'tekseries-blocks'
		) }
	/>
);

// The preview is the server render of the saved post, as visitors see it.
export default function Edit( { attributes }: BlockEditProps< Attributes > ) {
	return (
		<div { ...useBlockProps() }>
			<ServerSideRender
				block="tekseries/toc"
				attributes={ attributes }
				EmptyResponsePlaceholder={ Empty }
			/>
		</div>
	);
}
