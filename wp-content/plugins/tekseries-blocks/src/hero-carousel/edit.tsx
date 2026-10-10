import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';

export type Attributes = { ariaLabel?: string; autoplay: boolean };

// Editors see every slide, one under the other; the site shows one at a time.
export default function Edit( {
	attributes: { ariaLabel, autoplay },
	setAttributes,
}: BlockEditProps< Attributes > ) {
	const innerBlocksProps = useInnerBlocksProps( useBlockProps(), {
		allowedBlocks: [ 'core/cover' ],
		template: [ [ 'core/cover' ] ],
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'tekseries-blocks' ) }>
					<TextControl
						__next40pxDefaultSize
						label={ __(
							'Name for screen readers',
							'tekseries-blocks'
						) }
						help={ __(
							'What the slides are about, for example “Highlights”.',
							'tekseries-blocks'
						) }
						value={ ariaLabel ?? '' }
						onChange={ ( next: string ) =>
							setAttributes( { ariaLabel: next || undefined } )
						}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'Change slides automatically',
							'tekseries-blocks'
						) }
						help={ __(
							'Every 7 seconds, with a pause button. Visitors who ask for less motion get still slides.',
							'tekseries-blocks'
						) }
						checked={ autoplay }
						onChange={ ( next: boolean ) =>
							setAttributes( { autoplay: next } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps } />
		</>
	);
}
