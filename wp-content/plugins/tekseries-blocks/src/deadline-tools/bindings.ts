import {
	registerBlockBindingsSource,
	registerBlockVariation,
} from '@wordpress/blocks';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { store as coreStore } from '@wordpress/core-data';
import { dateI18n } from '@wordpress/date';
import { __ } from '@wordpress/i18n';

import { zonedTime } from '../deadline-countdown/time';

declare global {
	interface Window {
		tekseriesDeadlineText?: {
			formats: Record< Format, string >;
			defaultZone: string;
		};
	}
}

type Format = 'datetime' | 'date' | 'time';
type Args = { format?: Format; after?: string };
type Context = { postId?: number; postType?: string };
// The data stores' select(), as far as this source uses it.
type Select = ( store: unknown ) => {
	getEditedEntityRecord: (
		kind: string,
		name: string,
		id?: number
	) => { meta?: Record< string, string > } | undefined;
	getBlockAttributes: (
		clientId: string
	) => Record< string, unknown > | null;
};
type GetValues = {
	select: unknown;
	context: Context;
	clientId: string;
	bindings: Record< string, { args?: Args } >;
};

const SOURCE = 'tekseries/page-deadline';
const settings = window.tekseriesDeadlineText;
const FORMATS = settings?.formats ?? {
	datetime: 'F j, Y, g:i A T',
	date: 'F j, Y',
	time: 'g:i A T',
};
const DEFAULT_ZONE = settings?.defaultZone ?? 'Africa/Lagos';

const FIELDS: { label: string; args: Args }[] = [
	{
		label: __( 'Deadline: date and time', 'tekseries-blocks' ),
		args: { format: 'datetime' },
	},
	{
		label: __( 'Deadline: date', 'tekseries-blocks' ),
		args: { format: 'date' },
	},
	{
		label: __( 'Deadline: time', 'tekseries-blocks' ),
		args: { format: 'time' },
	},
];

// The page's deadline as the editor holds it, unsaved changes included: the
// moment (NaN without one) and the zone it is given in.
const deadlineOf = ( select: Select, { postId, postType }: Context ) => {
	const page =
		postType === 'page' && postId
			? select( coreStore ).getEditedEntityRecord(
					'postType',
					postType,
					postId
				)
			: undefined;
	const zone = page?.meta?.tekseries_deadline_timezone || DEFAULT_ZONE;
	const value = page?.meta?.tekseries_deadline ?? '';
	return { moment: value ? zonedTime( value, zone ) : NaN, zone };
};

// A text connected to the page's deadline: its date, its time, or both, in
// the page's time zone. The server writes the same text
// (tekseries_blocks_deadline_binding_value()); without a deadline the
// block's own text stays.
registerBlockBindingsSource( {
	name: SOURCE,
	usesContext: [ 'postId', 'postType' ],
	getValues( { select, context, clientId, bindings }: GetValues ) {
		const pick = select as Select;
		const { moment, zone } = deadlineOf( pick, context );
		const own = pick( blockEditorStore ).getBlockAttributes( clientId );
		const values: Record< string, unknown > = {};
		for ( const [ attribute, { args } ] of Object.entries( bindings ) ) {
			values[ attribute ] = Number.isNaN( moment )
				? own?.[ attribute ]
				: dateI18n(
						FORMATS[ args?.format ?? 'datetime' ],
						moment,
						zone
					) + ( args?.after ?? '' );
		}
		return values;
	},
	canUserEditValue: () => false,
	getFieldsList( { context } ) {
		return ( context as Context ).postType === 'page'
			? FIELDS.map( ( field ) => ( { ...field, type: 'string' } ) )
			: [];
	},
} );

// "Deadline date" in the inserter: a paragraph connected to the deadline.
registerBlockVariation( 'core/paragraph', {
	name: 'tekseries-deadline-date',
	title: __( 'Deadline date', 'tekseries-blocks' ),
	description: __(
		'The page’s deadline, written out. It changes with the deadline and its time zone.',
		'tekseries-blocks'
	),
	icon: 'calendar-alt',
	attributes: {
		metadata: {
			bindings: {
				content: { source: SOURCE, args: { format: 'date' } },
			},
		},
	},
	scope: [ 'inserter' ],
	isActive: ( attributes: Record< string, unknown > ) =>
		(
			attributes.metadata as
				{ bindings?: { content?: { source?: string } } } | undefined
		 )?.bindings?.content?.source === SOURCE,
} );
