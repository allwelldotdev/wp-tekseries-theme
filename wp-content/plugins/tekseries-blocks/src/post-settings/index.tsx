import { registerPlugin } from '@wordpress/plugins';
import {
	PluginDocumentSettingPanel,
	store as editorStore,
} from '@wordpress/editor';
import { useSelect } from '@wordpress/data';
import { store as coreStore, useEntityProp } from '@wordpress/core-data';
import { useSettings } from '@wordpress/block-editor';
import { BaseControl, Button, ColorPalette } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import './editor.scss';

declare global {
	interface Window {
		tekseriesPostSettings?: { postTypes: string[]; topicIcons: string[] };
	}
}

type ToneMeta = { tekseries_tone?: string; tekseries_icon?: string };
type IconRecord = { name: string; label: string; content: string };
type PaletteColor = { slug: string; color: string };

const TONES = [
	{ slug: 'saffron', name: __( 'Saffron', 'tekseries-blocks' ) },
	{ slug: 'plum', name: __( 'Plum', 'tekseries-blocks' ) },
	{ slug: 'ink', name: __( 'Ink', 'tekseries-blocks' ) },
	{ slug: 'lilac', name: __( 'Lilac', 'tekseries-blocks' ) },
];

const settings = window.tekseriesPostSettings ?? {
	postTypes: [],
	topicIcons: [],
};

function ToneControl( {
	value,
	onChange,
}: {
	value: string;
	onChange: ( tone: string ) => void;
} ) {
	const [ palette ] = useSettings( 'color.palette' ) as [
		PaletteColor[] | undefined,
	];
	const colors = TONES.map( ( { slug, name } ) => ( {
		name,
		color: palette?.find( ( item ) => item.slug === slug )?.color ?? '',
	} ) );
	const current = colors[ TONES.findIndex( ( t ) => t.slug === value ) ];

	return (
		<BaseControl
			__nextHasNoMarginBottom
			id="tekseries-tone"
			label={ __( 'Tone', 'tekseries-blocks' ) }
			help={
				value
					? __(
							'The post keeps this colour on its card and banner. Change it only to avoid a clash.',
							'tekseries-blocks'
						)
					: __(
							'Set automatically when the post is published: the next colour after the newest post.',
							'tekseries-blocks'
						)
			}
		>
			<ColorPalette
				colors={ colors }
				value={ current?.color }
				disableCustomColors
				clearable={ false }
				onChange={ ( color?: string ) => {
					const index = colors.findIndex(
						( item ) => item.color === color
					);
					onChange( TONES[ index ]?.slug ?? '' );
				} }
			/>
		</BaseControl>
	);
}

function IconControl( {
	value,
	defaultIcon,
	onChange,
}: {
	value: string;
	defaultIcon: string;
	onChange: ( icon: string ) => void;
} ) {
	const icons = useSelect(
		( select ) =>
			select( coreStore ).getEntityRecords( 'root', 'icon', {
				collection: 'tekseries',
			} ) as IconRecord[] | null,
		[]
	);
	const byName = new Map(
		( icons ?? [] ).map( ( icon ) => [
			icon.name.replace( 'tekseries/', '' ),
			icon,
		] )
	);
	const choices = [ '', ...settings.topicIcons ].flatMap( ( name ) => {
		const icon = byName.get( name || defaultIcon );
		if ( ! icon ) {
			return [];
		}
		const label = name
			? icon.label
			: sprintf(
					/* translators: %s: name of the icon the post shows by default. */
					__( 'Default (%s)', 'tekseries-blocks' ),
					icon.label
				);
		return [ { name, label, content: icon.content } ];
	} );

	return (
		<BaseControl
			__nextHasNoMarginBottom
			id="tekseries-icon"
			label={ __( 'Topic icon', 'tekseries-blocks' ) }
			help={ __(
				'Shown large on the card and banner. Default follows the event type.',
				'tekseries-blocks'
			) }
		>
			<div
				className="tekseries-icon-picker"
				role="group"
				aria-labelledby="tekseries-icon"
			>
				{ choices.map( ( choice ) => (
					<Button
						key={ choice.name || 'default' }
						className={
							choice.name ? undefined : 'is-default-icon'
						}
						label={ choice.label }
						isPressed={ value === choice.name }
						onClick={ () => onChange( choice.name ) }
					>
						<span
							aria-hidden="true"
							dangerouslySetInnerHTML={ {
								__html: choice.content,
							} }
						/>
					</Button>
				) ) }
			</div>
		</BaseControl>
	);
}

function PostToneSettings() {
	const postType = useSelect(
		( select ) => select( editorStore ).getCurrentPostType() as string,
		[]
	);
	const [ meta, setMeta ] = useEntityProp( 'postType', postType, 'meta' );
	const [ defaultIcon ] = useEntityProp(
		'postType',
		postType,
		'tekseries_default_icon'
	);

	if ( ! settings.postTypes.includes( postType ) ) {
		return null;
	}

	const values = ( meta ?? {} ) as ToneMeta;
	const update = ( change: ToneMeta ) => setMeta( { ...values, ...change } );

	return (
		<PluginDocumentSettingPanel
			name="tekseries-post-tone"
			title={ __( 'Tone and icon', 'tekseries-blocks' ) }
			className="tekseries-post-tone-panel"
		>
			<ToneControl
				value={ values.tekseries_tone ?? '' }
				onChange={ ( tone ) => update( { tekseries_tone: tone } ) }
			/>
			<IconControl
				value={ values.tekseries_icon ?? '' }
				defaultIcon={ ( defaultIcon as string | undefined ) ?? 'event' }
				onChange={ ( icon ) => update( { tekseries_icon: icon } ) }
			/>
		</PluginDocumentSettingPanel>
	);
}

registerPlugin( 'tekseries-post-tone', { render: PostToneSettings } );
