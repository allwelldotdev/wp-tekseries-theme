import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { PanelBody, RangeControl } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

export type Attributes = { perPage: number };

// The preview is the server render: the first photos and videos in albums.
export default function Edit( {
	attributes,
	setAttributes,
}: BlockEditProps< Attributes > ) {
	return (
		<div { ...useBlockProps() }>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'tekseries-blocks' ) }>
					<RangeControl
						__next40pxDefaultSize
						label={ __(
							'Items shown at first',
							'tekseries-blocks'
						) }
						help={ __(
							'“Load more” adds the same number again.',
							'tekseries-blocks'
						) }
						value={ attributes.perPage }
						min={ 4 }
						max={ 48 }
						onChange={ ( perPage ) =>
							setAttributes( { perPage: perPage ?? 12 } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<ServerSideRender
				block="tekseries/media-gallery"
				attributes={ attributes }
			/>
		</div>
	);
}
