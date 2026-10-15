import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import {
	Button,
	DateTimePicker,
	Notice,
	PanelBody,
	Placeholder,
	SelectControl,
} from '@wordpress/components';
import { useEntityProp } from '@wordpress/core-data';

import { two } from '../event-countdown/time';
import { daysLine, read, type Words } from './time';

export type Attributes = { view: 'tiles' | 'days' };
type DeadlineMeta = { tekseries_deadline?: string };

type Props = BlockEditProps< Attributes > & {
	context: { postId?: number; postType?: string };
};

// Words for the preview's days line; the site uses the server's.
const WORDS: Pick< Words, 'left' | 'lastDay' > = {
	left: [
		/* translators: %d: number of days, 1. */
		__( '%d day left to apply', 'tekseries-blocks' ),
		/* translators: %d: number of days. */
		__( '%d days left to apply', 'tekseries-blocks' ),
	],
	lastDay: __( 'Last day to apply', 'tekseries-blocks' ),
};

// The deadline is read in Nigerian time, which keeps UTC+1 all year
// (tekseries_blocks_event_timezone()).
const moment = ( value: string ) => Date.parse( `${ value }+01:00` );

// Sets the page's deadline (page meta, saved with the page) and previews the
// countdown as it stands when the editor opens; it doesn't tick here.
export default function Edit( {
	attributes: { view },
	setAttributes,
	context: { postId, postType },
}: Props ) {
	const onPage = postType === 'page' && !! postId;
	const [ meta, setMeta ] = useEntityProp(
		'postType',
		'page',
		'meta',
		onPage ? postId : undefined
	);
	const deadline = onPage
		? ( ( ( meta ?? {} ) as DeadlineMeta ).tekseries_deadline ?? '' )
		: '';
	const setDeadline = ( value: string ) =>
		setMeta( { ...meta, tekseries_deadline: value } );
	const blockProps = useBlockProps( {
		className: `is-${ view } is-live`,
	} );

	const reading = deadline ? read( moment( deadline ), Date.now() ) : null;

	let preview;
	if ( ! reading ) {
		preview = (
			<div { ...blockProps }>
				<Placeholder
					icon="clock"
					label={ __( 'Set the deadline', 'tekseries-blocks' ) }
					instructions={
						onPage
							? __(
									'Choose when applications close under Deadline in the block’s settings. Until then the page has no deadline and the countdown shows nothing.',
									'tekseries-blocks'
								)
							: __(
									'This block counts down to the deadline of the page it is placed in. Place it in a page’s content.',
									'tekseries-blocks'
								)
					}
				/>
			</div>
		);
	} else if ( view === 'days' ) {
		preview = (
			<p { ...blockProps }>
				{ reading.closed
					? __( '(Closed: this line is hidden.)', 'tekseries-blocks' )
					: daysLine( reading, WORDS ) }
			</p>
		);
	} else {
		const tiles: [ string, number ][] = [
			[ __( 'Days', 'tekseries-blocks' ), reading.days ],
			[ __( 'Hours', 'tekseries-blocks' ), reading.hours ],
			[ __( 'Minutes', 'tekseries-blocks' ), reading.minutes ],
			[ __( 'Seconds', 'tekseries-blocks' ), reading.seconds ],
		];
		preview = (
			<div
				{ ...blockProps }
				className={ `${ blockProps.className }${
					reading.closed ? ' is-closed' : ''
				}` }
			>
				<div className="ts-deadline__tiles">
					{ tiles.map( ( [ name, value ] ) => (
						<span className="ts-deadline__tile" key={ name }>
							<span className="ts-deadline__number">
								{ two( value ) }
							</span>
							<span className="ts-deadline__name">{ name }</span>
						</span>
					) ) }
				</div>
			</div>
		);
	}

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Deadline', 'tekseries-blocks' ) }>
					{ onPage ? (
						<>
							<DateTimePicker
								currentDate={ deadline || null }
								onChange={ ( value ) =>
									setDeadline( value ?? '' )
								}
								is12Hour
							/>
							<p className="components-base-control__help">
								{ __(
									'In Nigerian time (WAT), for the whole page. At this moment the countdown ends, blocks with the class ts-when-open hide and blocks with ts-when-closed show. Saved with the page. When you change it, also change the dates written in the page’s text.',
									'tekseries-blocks'
								) }
							</p>
							{ deadline && (
								<Button
									__next40pxDefaultSize
									variant="secondary"
									isDestructive
									onClick={ () => setDeadline( '' ) }
								>
									{ __(
										'Remove the deadline',
										'tekseries-blocks'
									) }
								</Button>
							) }
						</>
					) : (
						<Notice status="info" isDismissible={ false }>
							{ __(
								'The deadline is set on a page. Place this block in a page’s content to set it.',
								'tekseries-blocks'
							) }
						</Notice>
					) }
				</PanelBody>
				<PanelBody title={ __( 'Countdown', 'tekseries-blocks' ) }>
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Show', 'tekseries-blocks' ) }
						value={ view }
						options={ [
							{
								label: __(
									'Tiles: days, hours, minutes and seconds',
									'tekseries-blocks'
								),
								value: 'tiles',
							},
							{
								label: __(
									'Days line: “12 days left to apply”',
									'tekseries-blocks'
								),
								value: 'days',
							},
						] }
						onChange={ ( value: string ) =>
							setAttributes( {
								view: value === 'days' ? 'days' : 'tiles',
							} )
						}
						help={ __(
							'The editor shows the countdown as it stands now; on the site it ticks. The days line is left out once the deadline has passed.',
							'tekseries-blocks'
						) }
					/>
				</PanelBody>
			</InspectorControls>
			{ preview }
		</>
	);
}
