import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function Edit() {
	const innerBlocksProps = useInnerBlocksProps( useBlockProps() );

	return <div { ...innerBlocksProps } />;
}
