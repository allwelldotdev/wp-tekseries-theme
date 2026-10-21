import { __, sprintf } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import {
	Button,
	ComboboxControl,
	DateTimePicker,
	Notice,
	PanelBody,
	Placeholder,
	SelectControl,
} from '@wordpress/components';
import { useEntityProp } from '@wordpress/core-data';
import { dateI18n } from '@wordpress/date';

import { two } from '../event-countdown/time';
import { daysLine, read, zonedTime, type Words } from './time';
import './editor.scss';

export type Attributes = { view: 'tiles' | 'days' };
type DeadlineMeta = {
	tekseries_deadline?: string;
	tekseries_deadline_timezone?: string;
};

declare global {
	interface Window {
		tekseriesDeadline?: {
			zones: { value: string; label: string }[];
			defaultZone: string;
		};
	}
}

const ZONES = window.tekseriesDeadline?.zones ?? [];
const DEFAULT_ZONE = window.tekseriesDeadline?.defaultZone ?? 'Africa/Lagos';

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

// The picker has no seconds. A deadline picked at :59 closes at the end of
// that minute, so 11:59 PM is the last moment of the day; any other minute
// closes as it starts.
const withSeconds = ( value: string ) =>
	value
		? `${ value.slice( 0, 16 ) }:${
				value.slice( 14, 16 ) === '59' ? '59' : '00'
			}`
		: '';

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
	const saved = ( onPage ? ( meta ?? {} ) : {} ) as DeadlineMeta;
	const deadline = saved.tekseries_deadline ?? '';
	const ownZone = saved.tekseries_deadline_timezone ?? '';
	const zone = ownZone || DEFAULT_ZONE;
	const setDeadline = ( value: string ) =>
		setMeta( { ...meta, tekseries_deadline: withSeconds( value ) } );
	const setZone = ( value: string ) =>
		setMeta( {
			...meta,
			tekseries_deadline_timezone: value === DEFAULT_ZONE ? '' : value,
		} );
	const blockProps = useBlockProps( {
		className: `is-${ view } is-live`,
	} );

	const moment = deadline ? zonedTime( deadline, zone ) : NaN;
	const reading = Number.isNaN( moment ) ? null : read( moment, Date.now() );

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
				<PanelBody
					title={ __( 'Deadline', 'tekseries-blocks' ) }
					className="ts-deadline-panel"
				>
					{ onPage ? (
						<>
							<DateTimePicker
								currentDate={ deadline || null }
								onChange={ ( value ) =>
									setDeadline( value ?? '' )
								}
								is12Hour
							/>
							<ComboboxControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __( 'Time zone', 'tekseries-blocks' ) }
								value={ zone }
								options={ ZONES }
								onChange={ ( value ) => setZone( value ?? '' ) }
								allowReset={ false }
							/>
							{ ownZone && (
								<Button
									__next40pxDefaultSize
									variant="link"
									onClick={ () => setZone( '' ) }
								>
									{ __(
										'Use Nigerian time (WAT)',
										'tekseries-blocks'
									) }
								</Button>
							) }
							<p className="components-base-control__help">
								{ reading
									? sprintf(
											/* translators: %s: the moment the deadline passes, e.g. "December 1, 2026, 11:59:59 PM WAT". */
											__(
												'Applications close at %s, for the whole page. Then the countdown ends, and blocks set under Deadline › Show to show before the deadline hide while those set to show after it appear. Saved with the page. When you change it, also change the dates written in the page’s text.',
												'tekseries-blocks'
											),
											dateI18n(
												'F j, Y, g:i:s A T',
												moment,
												zone
											)
										)
									: __(
											'Pick the day and time applications close, and the time zone they are given in. Saved with the page.',
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
