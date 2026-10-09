// @wordpress/block-editor ships no type declarations, and @types/wordpress__block-editor
// pins older @wordpress packages. These cover only the parts the plugin uses.
declare module '@wordpress/block-editor' {
	import type { ComponentType, HTMLAttributes, ReactNode } from 'react';

	type BlockProps = HTMLAttributes< HTMLElement > & Record< string, unknown >;

	export function useBlockProps( props?: BlockProps ): BlockProps;
	export function useInnerBlocksProps(
		props?: BlockProps,
		options?: {
			allowedBlocks?: string[];
			template?: Array< [ string, Record< string, unknown >? ] >;
			templateLock?: false | 'all' | 'insert' | 'contentOnly';
		}
	): BlockProps & { children: ReactNode };

	export function useSettings( ...paths: string[] ): unknown[];

	export const InnerBlocks: ComponentType & { Content: ComponentType };
	export const InspectorControls: ComponentType< {
		group?: 'default' | 'settings' | 'styles';
		children?: ReactNode;
	} >;
}
