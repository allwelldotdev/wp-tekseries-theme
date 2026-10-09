import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { PanelBody, RangeControl } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

export type Attributes = { perPage: number };

// The preview is the server render: the first page of open jobs.
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
						label={ __( 'Jobs per page', 'tekseries-blocks' ) }
						value={ attributes.perPage }
						min={ 5 }
						max={ 50 }
						onChange={ ( perPage ) =>
							setAttributes( { perPage: perPage ?? 25 } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<ServerSideRender
				block="tekseries/job-listings"
				attributes={ attributes }
			/>
		</div>
	);
}
