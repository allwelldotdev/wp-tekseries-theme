import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	store as blockEditorStore,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
	createBlocksFromInnerBlocksTemplate,
	type BlockEditProps,
} from '@wordpress/blocks';
import {
	Button,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

import { SLIDE } from './slide';
import './editor.scss';

export type Attributes = {
	ariaLabel?: string;
	autoplay: boolean;
	interval: number;
	pauseOnHover: boolean;
	dotSpacing: 'touch' | 'close';
};

// What this block asks of the block editor's store.
type Blocks = ReturnType< typeof createBlocksFromInnerBlocksTemplate >;
type EditorActions = {
	insertBlocks: (
		blocks: Blocks,
		index?: number,
		rootClientId?: string
	) => void;
	replaceBlocks: ( clientIds: string[], blocks: Blocks ) => void;
	__unstableMarkNextChangeAsNotPersistent: () => void;
};
type EditorSelectors = { getBlocks: ( rootClientId?: string ) => Blocks };

const newSlide = () => createBlocksFromInnerBlocksTemplate( [ SLIDE ] );

// A Cover with no picture, no overlay and nothing in it: what the block
// library inserts.
const isBare = ( { name, attributes, innerBlocks }: Blocks[ number ] ) =>
	name === 'core/cover' &&
	! innerBlocks.length &&
	! [
		'url',
		'gradient',
		'customGradient',
		'overlayColor',
		'customOverlayColor',
	].some( ( key ) => attributes[ key ] );

// Editors see every slide, one under the other; the site shows one at a time.
export default function Edit( {
	attributes: { ariaLabel, autoplay, interval, pauseOnHover, dotSpacing },
	setAttributes,
	clientId,
}: BlockEditProps< Attributes > ) {
	const {
		insertBlocks,
		replaceBlocks,
		__unstableMarkNextChangeAsNotPersistent: sameStep,
	} = useDispatch( blockEditorStore ) as EditorActions;
	// How many slides there are, and which of them are bare Covers (as text,
	// so the value only changes when the slides do).
	const { count, bare } = useSelect(
		( select ) => {
			const slides = (
				select( blockEditorStore ) as EditorSelectors
			 ).getBlocks( clientId );
			return {
				count: slides.length,
				bare: slides
					.filter( isBare )
					.map( ( slide ) => slide.clientId )
					.join( ' ' ),
			};
		},
		[ clientId ]
	);
	// A new slide arrives whole (label, heading, line, buttons, the three
	// labels), after the last one. The block's default appender would add a
	// bare Cover: a default block can't carry inner blocks.
	const addSlide = () => insertBlocks( newSlide(), count, clientId );

	// A Cover that came bare from the block library becomes a whole slide
	// too. It counts as part of the step that inserted it, so Undo takes the
	// slide away instead of bringing the bare Cover back to be filled again.
	useEffect( () => {
		for ( const id of bare.split( ' ' ).filter( Boolean ) ) {
			sameStep();
			replaceBlocks( [ id ], newSlide() );
		}
	}, [ bare, replaceBlocks, sameStep ] );

	const innerBlocksProps = useInnerBlocksProps( useBlockProps(), {
		allowedBlocks: [ 'core/cover' ],
		template: [ SLIDE ],
		renderAppender: () => (
			<Button
				__next40pxDefaultSize
				className="ts-carousel__add"
				variant="secondary"
				onClick={ addSlide }
			>
				{ __( 'Add slide', 'tekseries-blocks' ) }
			</Button>
		),
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
							'With a pause button. Visitors who ask for less motion get still slides.',
							'tekseries-blocks'
						) }
						checked={ autoplay }
						onChange={ ( next: boolean ) =>
							setAttributes( { autoplay: next } )
						}
					/>
					{ autoplay && (
						<>
							<RangeControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __(
									'Seconds on each slide',
									'tekseries-blocks'
								) }
								min={ 3 }
								max={ 30 }
								value={ interval }
								onChange={ ( next?: number ) =>
									setAttributes( { interval: next ?? 7 } )
								}
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __(
									'Hold while the pointer is over the slides',
									'tekseries-blocks'
								) }
								help={ __(
									'The slides always hold while keyboard focus is inside them.',
									'tekseries-blocks'
								) }
								checked={ pauseOnHover }
								onChange={ ( next: boolean ) =>
									setAttributes( { pauseOnHover: next } )
								}
							/>
						</>
					) }
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Space between dots', 'tekseries-blocks' ) }
						help={ __(
							'Close dots are harder to tap on a phone. With three or more slides they are smaller than the accessibility guideline’s smallest target.',
							'tekseries-blocks'
						) }
						value={ dotSpacing }
						options={ [
							{
								value: 'touch',
								label: __(
									'Easy to tap (44px each)',
									'tekseries-blocks'
								),
							},
							{
								value: 'close',
								label: __(
									'Close together (8px apart)',
									'tekseries-blocks'
								),
							},
						] }
						onChange={ ( next: string ) =>
							setAttributes( {
								dotSpacing:
									next === 'close' ? 'close' : 'touch',
							} )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps } />
		</>
	);
}
