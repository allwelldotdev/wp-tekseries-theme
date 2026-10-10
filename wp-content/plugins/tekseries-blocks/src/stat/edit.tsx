import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { PanelBody, TextControl } from '@wordpress/components';

export type Attributes = { value: number; suffix: string };

// The editor shows the finished figure; the count-up runs only on the site.
export default function Edit( {
	attributes: { value, suffix },
	setAttributes,
}: BlockEditProps< Attributes > ) {
	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'tekseries-blocks' ) }>
					<TextControl
						__next40pxDefaultSize
						type="number"
						min={ 0 }
						label={ __( 'Number', 'tekseries-blocks' ) }
						value={ String( value ) }
						onChange={ ( next: string ) =>
							setAttributes( {
								value: Math.max( 0, parseInt( next, 10 ) || 0 ),
							} )
						}
					/>
					<TextControl
						__next40pxDefaultSize
						label={ __( 'After the number', 'tekseries-blocks' ) }
						help={ __(
							'For example + or %. Leave it empty for none.',
							'tekseries-blocks'
						) }
						value={ suffix }
						onChange={ ( next: string ) =>
							setAttributes( { suffix: next } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<p { ...useBlockProps() }>
				{ value }
				<span className="ts-stat__suffix">{ suffix }</span>
			</p>
		</>
	);
}
