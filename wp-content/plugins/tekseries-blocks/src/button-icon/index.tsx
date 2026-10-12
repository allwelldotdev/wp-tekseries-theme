import { addFilter } from '@wordpress/hooks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { ComponentType } from '@wordpress/element';

declare global {
	interface Window {
		tekseriesButtonIcons?: { name: string; label: string }[];
	}
}

type ButtonProps = {
	name: string;
	attributes: { className?: string };
	setAttributes: ( next: { className?: string } ) => void;
};

const icons = window.tekseriesButtonIcons ?? [];
const PREFIX = 'ts-icon-';
const AFTER = 'ts-icon-after';
// Classes that say how an icon is drawn, not which one.
const MODIFIERS = [ AFTER, 'ts-icon-small' ];

const isIcon = ( token: string ) =>
	token.startsWith( PREFIX ) && ! MODIFIERS.includes( token );

// The icon lives in the button's class list (ts-icon-<name>, ts-icon-after):
// there is no new attribute, so a saved button is valid with or without this
// plugin, and the theme draws the icon in CSS. Nothing loads for visitors.
function IconPanel( { attributes, setAttributes }: ButtonProps ) {
	const tokens = ( attributes.className ?? '' )
		.split( /\s+/ )
		.filter( Boolean );
	const current = tokens.find( isIcon )?.slice( PREFIX.length ) ?? '';
	const save = ( next: string[] ) =>
		setAttributes( { className: next.join( ' ' ) || undefined } );

	const options = [
		{ value: '', label: __( 'None', 'tekseries-blocks' ) },
		...icons.map( ( { name, label } ) => ( { value: name, label } ) ),
	];
	// A name typed by hand under Advanced stays selectable.
	if ( current && ! icons.some( ( { name } ) => name === current ) ) {
		options.push( { value: current, label: current } );
	}

	return (
		<InspectorControls>
			<PanelBody title={ __( 'Icon', 'tekseries-blocks' ) }>
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Icon', 'tekseries-blocks' ) }
					value={ current }
					options={ options }
					onChange={ ( name: string ) =>
						save( [
							// Without an icon, "after the text" means nothing.
							...tokens.filter(
								( token ) =>
									! isIcon( token ) &&
									( name || token !== AFTER )
							),
							...( name ? [ PREFIX + name ] : [] ),
						] )
					}
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __( 'Icon after the text', 'tekseries-blocks' ) }
					checked={ tokens.includes( AFTER ) }
					disabled={ ! current }
					onChange={ ( after: boolean ) =>
						save(
							after
								? [ ...tokens, AFTER ]
								: tokens.filter( ( token ) => token !== AFTER )
						)
					}
				/>
			</PanelBody>
		</InspectorControls>
	);
}

addFilter(
	'editor.BlockEdit',
	'tekseries/button-icon',
	( BlockEdit: ComponentType< ButtonProps > ) =>
		function WithButtonIcon( props: ButtonProps ) {
			return (
				<>
					<BlockEdit { ...props } />
					{ props.name === 'core/button' && (
						<IconPanel { ...props } />
					) }
				</>
			);
		}
);
