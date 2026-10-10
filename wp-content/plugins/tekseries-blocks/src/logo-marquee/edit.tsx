import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { PanelBody, TextControl } from '@wordpress/components';

export type Attributes = { ariaLabel?: string };

// Editors arrange the logos in a still row; the strip moves only on the site.
export default function Edit( {
	attributes: { ariaLabel },
	setAttributes,
}: BlockEditProps< Attributes > ) {
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'ts-marquee__set' },
		{ allowedBlocks: [ 'core/image' ], orientation: 'horizontal' }
	);

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
							'What the logos are, for example “Organisations we have worked with”.',
							'tekseries-blocks'
						) }
						value={ ariaLabel ?? '' }
						onChange={ ( next: string ) =>
							setAttributes( { ariaLabel: next || undefined } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...useBlockProps() }>
				<div { ...innerBlocksProps } />
			</div>
		</>
	);
}
