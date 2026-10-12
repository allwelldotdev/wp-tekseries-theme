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
			orientation?: 'horizontal' | 'vertical';
			template?: InnerBlocksTemplate[];
			renderAppender?: false | ComponentType;
			templateLock?: false | 'all' | 'insert' | 'contentOnly';
		}
	): BlockProps & { children: ReactNode };

	export function useSettings( ...paths: string[] ): unknown[];

	// A block with its attributes and, optionally, its own inner blocks.
	type InnerBlocksTemplate = [
		string,
		Record< string, unknown >?,
		InnerBlocksTemplate[]?,
	];

	// The block editor's data store. The data package accepts a store by its
	// name as well, which is all this says about it: the code that uses the
	// store names the actions and selectors it calls.
	export const store: 'core/block-editor';

	export const InnerBlocks: ComponentType & { Content: ComponentType };
	export const InspectorControls: ComponentType< {
		group?: 'default' | 'settings' | 'styles';
		children?: ReactNode;
	} >;
}
