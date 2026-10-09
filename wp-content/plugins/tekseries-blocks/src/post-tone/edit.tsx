import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { PanelBody, SelectControl } from '@wordpress/components';
import { store as coreStore, useEntityProp } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';

export type Attributes = { variant: 'card' | 'banner' };
type ToneMeta = { tekseries_tone?: string; tekseries_icon?: string };
type Icon = { content?: string };

type Props = BlockEditProps< Attributes > & {
	context: { postId?: number; postType?: string };
};

// Previews the post's stored tone and icon, as render.php does. Outside a post
// (a template with no post) it shows plum and no icon.
export default function Edit( {
	attributes: { variant },
	setAttributes,
	context: { postId, postType = 'post' },
}: Props ) {
	const [ meta ] = useEntityProp( 'postType', postType, 'meta', postId );
	const [ defaultIcon ] = useEntityProp(
		'postType',
		postType,
		'tekseries_default_icon',
		postId
	);

	const { tekseries_tone: tone, tekseries_icon: pickedIcon } = (
		postId ? ( meta ?? {} ) : {}
	) as ToneMeta;
	const iconName = postId ? pickedIcon || ( defaultIcon as string ) : '';

	const icon = useSelect(
		( select ) =>
			iconName
				? ( select( coreStore ).getEntityRecord(
						'root',
						'icon',
						`tekseries/${ iconName }`
					) as Icon | undefined )
				: undefined,
		[ iconName ]
	);

	const { children, ...innerBlocksProps } = useInnerBlocksProps(
		useBlockProps( {
			className: `ts-tone--${ tone || 'plum' } ts-tone--${ variant }`,
		} )
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'tekseries-blocks' ) }>
					<SelectControl
						__next40pxDefaultSize
						label={ __( 'Shape', 'tekseries-blocks' ) }
						help={ __(
							"The tone and icon come from the post. Change them in the post's sidebar.",
							'tekseries-blocks'
						) }
						value={ variant }
						options={ [
							{
								value: 'card',
								label: __( 'Card media', 'tekseries-blocks' ),
							},
							{
								value: 'banner',
								label: __( 'Banner', 'tekseries-blocks' ),
							},
						] }
						onChange={ ( value: string ) =>
							setAttributes( {
								variant: value === 'banner' ? 'banner' : 'card',
							} )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps }>
				{ children }
				{ icon?.content && (
					<span
						className="ts-tone__icon"
						aria-hidden="true"
						dangerouslySetInnerHTML={ { __html: icon.content } }
					/>
				) }
			</div>
		</>
	);
}
