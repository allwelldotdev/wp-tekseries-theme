import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { PanelBody, SelectControl } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

export type Attributes = { part: 'form' | 'status' };

// The form previews as the server draws it. The results line only shows
// while a visitor searches, so the editor names it instead.
export default function Edit( {
	attributes,
	setAttributes,
}: BlockEditProps< Attributes > ) {
	const { part } = attributes;
	return (
		<div { ...useBlockProps() }>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'tekseries-blocks' ) }>
					<SelectControl
						label={ __( 'Shows', 'tekseries-blocks' ) }
						value={ part }
						options={ [
							{
								label: __(
									'The search form',
									'tekseries-blocks'
								),
								value: 'form',
							},
							{
								label: __(
									'What the search found',
									'tekseries-blocks'
								),
								value: 'status',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( {
								part: value as Attributes[ 'part' ],
							} )
						}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>
			{ 'form' === part ? (
				<ServerSideRender
					block="tekseries/event-search"
					attributes={ attributes }
				/>
			) : (
				<p className="ts-event-search__placeholder">
					{ __(
						'Event search results: the count of matches, or a card when nothing matches. Shows while a visitor searches.',
						'tekseries-blocks'
					) }
				</p>
			) }
		</div>
	);
}
