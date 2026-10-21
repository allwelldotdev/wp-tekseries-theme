import { addFilter } from '@wordpress/hooks';
import {
	InspectorControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { cloneBlock, createBlock, hasBlockSupport } from '@wordpress/blocks';
import {
	Button,
	Notice,
	PanelBody,
	PanelRow,
	RadioControl,
	ToggleControl,
} from '@wordpress/components';
import { select, useDispatch, useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import type { ComponentType } from '@wordpress/element';

import {
	CLOSED_BUTTON_CLASSES,
	closedButtonAttributes,
	isClosedButton,
	whenOf,
	withWhen,
	type When,
} from './tokens';
import './bindings';

type Props = {
	name: string;
	clientId: string;
	isSelected: boolean;
	attributes: Record< string, unknown > & {
		className?: string;
		tagName?: string;
	};
	setAttributes: ( next: Record< string, unknown > ) => void;
};

// What this panel asks of the block editor's store.
type Block = ReturnType< typeof createBlock >;
type EditorActions = {
	insertBlocks: (
		blocks: Block,
		index?: number,
		rootClientId?: string
	) => void;
};
type EditorSelectors = {
	getBlock: ( clientId: string ) => Block | null;
	getBlockIndex: ( clientId: string ) => number;
	getBlockRootClientId: ( clientId: string ) => string | null;
};

// The block that sets the deadline has its own Deadline panel.
const SKIP = [ 'tekseries/deadline-countdown' ];

// A "Deadline" panel on a page's blocks: when visitors see the block, before
// or after the page's deadline, and, on a Button, whether it is the disabled
// "Applications closed" button. Shown only on a page that has a deadline, or
// on a block already set to follow one.
function DeadlinePanel( { name, clientId, attributes, setAttributes }: Props ) {
	const when = whenOf( attributes.className );
	const { onPage, hasDeadline } = useSelect( ( pick ) => {
		const editor = pick( editorStore );
		const meta = editor.getEditedPostAttribute( 'meta' ) as
			{ tekseries_deadline?: string } | undefined;
		return {
			onPage: editor.getCurrentPostType() === 'page',
			hasDeadline: !! meta?.tekseries_deadline,
		};
	}, [] );
	const { insertBlocks } = useDispatch( blockEditorStore ) as EditorActions;

	if ( ! onPage || ( ! hasDeadline && ! when ) ) {
		return null;
	}

	const isButton = name === 'core/button';
	const closedButton = isButton && isClosedButton( attributes );

	// After a block shown before the deadline, the one that takes its place:
	// for a Button, a disabled "Applications closed" button.
	const addTwin = () => {
		const { getBlock, getBlockIndex, getBlockRootClientId } = select(
			blockEditorStore
		) as unknown as EditorSelectors;
		const block = getBlock( clientId );
		if ( ! block ) {
			return;
		}
		const twin = isButton
			? createBlock( 'core/button', {
					tagName: 'button',
					text: __( 'Applications closed', 'tekseries-blocks' ),
					className: CLOSED_BUTTON_CLASSES,
				} )
			: cloneBlock( block, {
					className: withWhen( attributes.className, 'closed' ),
				} );
		insertBlocks(
			twin,
			getBlockIndex( clientId ) + 1,
			getBlockRootClientId( clientId ) ?? undefined
		);
	};

	return (
		<InspectorControls>
			<PanelBody title={ __( 'Deadline', 'tekseries-blocks' ) }>
				{ ! hasDeadline && (
					<Notice status="warning" isDismissible={ false }>
						{ __(
							'This page has no deadline, so visitors always see blocks set to show before it and never see blocks set to show after it. Set the deadline in a Deadline Countdown block.',
							'tekseries-blocks'
						) }
					</Notice>
				) }
				<RadioControl
					label={ __( 'Show', 'tekseries-blocks' ) }
					selected={ when }
					options={ [
						{
							label: __( 'Always', 'tekseries-blocks' ),
							value: '',
						},
						{
							label: __(
								'Before the deadline',
								'tekseries-blocks'
							),
							value: 'open',
						},
						{
							label: __(
								'After the deadline',
								'tekseries-blocks'
							),
							value: 'closed',
						},
					] }
					onChange={ ( value: string ) =>
						setAttributes( {
							className: withWhen(
								attributes.className,
								value as When
							),
						} )
					}
					help={ __(
						'Visitors see this block only before or only after the page’s deadline. The editor shows both kinds; blocks shown after the deadline have a dashed outline.',
						'tekseries-blocks'
					) }
				/>
				{ when === 'open' && (
					<PanelRow>
						<Button
							__next40pxDefaultSize
							variant="secondary"
							onClick={ addTwin }
						>
							{ isButton
								? __(
										'Add the closed button after it',
										'tekseries-blocks'
									)
								: __(
										'Add a copy to show after the deadline',
										'tekseries-blocks'
									) }
						</Button>
					</PanelRow>
				) }
				{ isButton && (
					<PanelRow>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __(
								'Applications closed button (disabled)',
								'tekseries-blocks'
							) }
							checked={ closedButton }
							onChange={ ( on: boolean ) =>
								setAttributes(
									closedButtonAttributes( attributes, on )
								)
							}
							help={
								closedButton
									? __(
											'A greyed button visitors can’t click. Turn this off to make it a link again, then add the link from the toolbar.',
											'tekseries-blocks'
										)
									: __(
											'Makes this a greyed button visitors can’t click, with no link.',
											'tekseries-blocks'
										)
							}
						/>
					</PanelRow>
				) }
			</PanelBody>
		</InspectorControls>
	);
}

addFilter(
	'editor.BlockEdit',
	'tekseries/deadline-tools',
	( BlockEdit: ComponentType< Props > ) =>
		function WithDeadlinePanel( props: Props ) {
			return (
				<>
					<BlockEdit { ...props } />
					{ props.isSelected &&
						! SKIP.includes( props.name ) &&
						hasBlockSupport(
							props.name,
							'customClassName',
							true
						) && <DeadlinePanel { ...props } /> }
				</>
			);
		}
);
