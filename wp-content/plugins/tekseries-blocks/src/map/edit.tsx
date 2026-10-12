import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import {
	Notice,
	PanelBody,
	Placeholder,
	TextareaControl,
	TextControl,
} from '@wordpress/components';
import { useState } from '@wordpress/element';

import { embedSource } from './embed';
import './editor.scss';

export type Attributes = { src: string; title: string };

const HOW = __(
	'In Google Maps, find the place, choose Share, then “Embed a map”, copy the code and paste it here.',
	'tekseries-blocks'
);

// Editors paste Google's embed code; the block keeps only the map's address.
// The canvas shows a still card: the map itself loads for visitors.
export default function Edit( {
	attributes: { src, title },
	setAttributes,
}: BlockEditProps< Attributes > ) {
	const [ pasted, setPasted ] = useState( src );
	const refused = pasted.trim() !== '' && embedSource( pasted ) === '';
	const paste = ( next: string ) => {
		setPasted( next );
		const source = embedSource( next );
		// Something that is not a Google Maps embed leaves the map as it was.
		if ( source !== '' || next.trim() === '' ) {
			setAttributes( { src: source } );
		}
	};

	const field = (
		<>
			<TextareaControl
				__nextHasNoMarginBottom
				label={ __( 'Google Maps embed code', 'tekseries-blocks' ) }
				help={ HOW }
				rows={ 4 }
				value={ pasted }
				onChange={ paste }
			/>
			{ refused && (
				<Notice status="warning" isDismissible={ false }>
					{ __(
						'That is not a Google Maps embed code, so the map was not changed.',
						'tekseries-blocks'
					) }
				</Notice>
			) }
		</>
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Map', 'tekseries-blocks' ) }>
					{ field }
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __(
							'Name for screen readers',
							'tekseries-blocks'
						) }
						help={ __(
							'What the map shows, for example “Map: TekSeries, Queens, New York”.',
							'tekseries-blocks'
						) }
						value={ title }
						onChange={ ( next: string ) =>
							setAttributes( { title: next } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...useBlockProps() }>
				{ src ? (
					<div className="ts-map__preview">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 -960 960 960"
							aria-hidden="true"
						>
							<path d="M480-301q99-80 149.500-154T680-594q0-90-56-148t-144-58q-88 0-144 58t-56 148q0 65 50.500 139T480-301Zm0 101Q339-304 269.500-402T200-594q0-125 78-205.500T480-880q124 0 202 80.500T760-594q0 94-69.500 192T480-200Zm0-320q33 0 56.500-23.500T560-600q0-33-23.500-56.500T480-680q-33 0-56.500 23.500T400-600q0 33 23.500 56.500T480-520ZM200-80v-80h560v80H200Zm280-520Z" />
						</svg>
						<p className="ts-map__preview-title">
							{ title || __( 'Google map', 'tekseries-blocks' ) }
						</p>
						<p>
							{ __(
								'The map shows on the site. Change it in the block’s settings.',
								'tekseries-blocks'
							) }
						</p>
					</div>
				) : (
					<Placeholder
						icon="location-alt"
						label={ __( 'Map', 'tekseries-blocks' ) }
						instructions={ HOW }
					>
						{ field }
					</Placeholder>
				) }
			</div>
		</>
	);
}
