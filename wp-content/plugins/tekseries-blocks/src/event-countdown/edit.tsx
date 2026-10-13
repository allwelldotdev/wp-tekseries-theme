import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { PanelBody, SelectControl } from '@wordpress/components';

export type Attributes = { size: 'full' | 'compact' };

// The sample's figures, with the names render.php prints.
const SAMPLE: [ string, string ][] = [
	[ '12', __( 'days', 'tekseries-blocks' ) ],
	[ '04', __( 'hrs', 'tekseries-blocks' ) ],
	[ '30', __( 'min', 'tekseries-blocks' ) ],
	[ '15', __( 'sec', 'tekseries-blocks' ) ],
];

// The editor shows a sample: the real figures depend on the event the block
// is drawn for, and on the moment.
export default function Edit( {
	attributes: { size },
	setAttributes,
}: BlockEditProps< Attributes > ) {
	const blockProps = useBlockProps( { className: `is-${ size } is-live` } );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Countdown', 'tekseries-blocks' ) }>
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Size', 'tekseries-blocks' ) }
						value={ size }
						options={ [
							{
								label: __(
									'Full: days, hours, minutes and seconds',
									'tekseries-blocks'
								),
								value: 'full',
							},
							{
								label: __(
									'Compact: one line, for a card',
									'tekseries-blocks'
								),
								value: 'compact',
							},
						] }
						onChange={ ( value: string ) =>
							setAttributes( {
								size: value === 'compact' ? 'compact' : 'full',
							} )
						}
						help={ __(
							'This is a sample. On the site the block counts down to the event’s date and start time, and shows nothing once the event’s day is over.',
							'tekseries-blocks'
						) }
					/>
				</PanelBody>
			</InspectorControls>
			{ size === 'compact' ? (
				<p { ...blockProps }>
					{ __( 'In 12 days', 'tekseries-blocks' ) }
				</p>
			) : (
				<div { ...blockProps }>
					<div className="ts-countdown__show">
						<span className="ts-countdown__label">
							{ __( 'Starts in', 'tekseries-blocks' ) }
						</span>
						<span className="ts-countdown__units">
							{ SAMPLE.map( ( [ number, name ] ) => (
								<span
									className="ts-countdown__unit"
									key={ name }
								>
									<span className="ts-countdown__number">
										{ number }
									</span>
									<span className="ts-countdown__name">
										{ name }
									</span>
								</span>
							) ) }
						</span>
					</div>
				</div>
			) }
		</>
	);
}
