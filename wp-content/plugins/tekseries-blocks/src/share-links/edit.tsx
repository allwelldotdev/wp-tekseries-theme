import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { CheckboxControl, PanelBody } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

type Service = 'linkedin' | 'facebook' | 'x' | 'whatsapp' | 'link';
export type Attributes = { services: Service[] };

const SERVICES: [ Service, string ][] = [
	[ 'linkedin', __( 'LinkedIn', 'tekseries-blocks' ) ],
	[ 'facebook', __( 'Facebook', 'tekseries-blocks' ) ],
	[ 'x', __( 'X', 'tekseries-blocks' ) ],
	[ 'whatsapp', __( 'WhatsApp', 'tekseries-blocks' ) ],
	[ 'link', __( 'Link to this page', 'tekseries-blocks' ) ],
];

// The preview is the server render, so the editor shows the same icons and links.
export default function Edit( {
	attributes,
	setAttributes,
}: BlockEditProps< Attributes > ) {
	const { services } = attributes;
	const toggle = ( service: Service, on: boolean ) =>
		setAttributes( {
			// Keep the order of SERVICES, whatever order they were ticked in.
			services: SERVICES.map( ( [ name ] ) => name ).filter( ( name ) =>
				name === service ? on : services.includes( name )
			),
		} );

	return (
		<div { ...useBlockProps() }>
			<InspectorControls>
				<PanelBody title={ __( 'Services', 'tekseries-blocks' ) }>
					{ SERVICES.map( ( [ name, label ] ) => (
						<CheckboxControl
							key={ name }
							label={ label }
							checked={ services.includes( name ) }
							onChange={ ( on: boolean ) => toggle( name, on ) }
						/>
					) ) }
				</PanelBody>
			</InspectorControls>
			<ServerSideRender
				block="tekseries/share-links"
				attributes={ attributes }
			/>
		</div>
	);
}
