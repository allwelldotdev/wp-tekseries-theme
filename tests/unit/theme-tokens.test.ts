import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// theme.json must implement the design system's tokens. When a design pull
// changes tokens.json, these tests fail until theme.json catches up.

type Preset = { slug: string; name: string };
type Token = { name: string; value: string };
type TypeStyle = { name: string; fontSize: string };

function readJson< T >( relativePath: string ): T {
	return JSON.parse(
		readFileSync( new URL( relativePath, import.meta.url ), 'utf8' )
	) as T;
}

const theme = readJson< {
	settings: {
		viewport: Record< string, string >;
		color: {
			palette: ( Preset & { color: string } )[];
			gradients: Preset[];
		};
		typography: {
			fontFamilies: ( Preset & {
				fontFace?: { fontFamily: string; src: string[] }[];
			} )[];
			fontSizes: ( Preset & {
				size: string;
				fluid: { min: string; max: string } | false;
			} )[];
		};
		spacing: { spacingSizes: ( Preset & { size: string } )[] };
		border: { radiusSizes: ( Preset & { size: string } )[] };
	};
	styles: unknown;
} >( '../../wp-content/themes/tekseries/theme.json' );

const tokens = readJson< {
	color: { tokens: Token[] };
	type: { groups: { styles: TypeStyle[] }[] };
	spacing: { tokens: Token[] };
	radius: { tokens: Token[] };
	layout: { tokens: Token[] };
} >( '../../docs/design-reference/design-system/tekseries/tokens.json' );

const { settings } = theme;
const token = ( list: Token[], name: string ) =>
	list.find( ( t ) => t.name === name )?.value;
const typeStyle = ( name: string ) =>
	tokens.type.groups
		.flatMap( ( group ) => group.styles )
		.find( ( style ) => style.name === name )?.fontSize;
const rem = ( px: string | undefined ) => `${ parseFloat( px ?? '' ) / 16 }rem`;
// The largest value in a size or clamp(), in rem: the desktop end.
const clampMax = ( size: string ) => size.match( /([\d.]+rem)\)$/ )?.[ 1 ];

const THEME = new URL( '../../wp-content/themes/tekseries/', import.meta.url );
const presets: Record< string, string[] > = {
	color: settings.color.palette.map( ( p ) => p.slug ),
	gradient: settings.color.gradients.map( ( p ) => p.slug ),
	'font-family': settings.typography.fontFamilies.map( ( p ) => p.slug ),
	'font-size': settings.typography.fontSizes.map( ( p ) => p.slug ),
	spacing: settings.spacing.spacingSizes.map( ( p ) => p.slug ),
	'border-radius': settings.border.radiusSizes.map( ( p ) => p.slug ),
};

describe( 'theme.json tokens', () => {
	it( 'has every solid design-system colour with its exact value', () => {
		const solids = tokens.color.tokens.filter( ( t ) =>
			t.value.startsWith( '#' )
		);
		expect( solids.length ).toBeGreaterThan( 0 );
		for ( const { name, value } of solids ) {
			const entry = settings.color.palette.find(
				( p ) => p.slug === name
			);
			expect( { [ name ]: entry?.color.toUpperCase() } ).toEqual( {
				[ name ]: value.toUpperCase(),
			} );
		}
	} );

	it( 'adds the accessible coral and the status colours', () => {
		const slugs = settings.color.palette.map( ( p ) => p.slug );
		expect( slugs ).toEqual(
			expect.arrayContaining( [
				'coral-text',
				'success',
				'success-soft',
				'warning',
				'warning-soft',
				'danger',
				'danger-soft',
				'neutral-soft',
			] )
		);
	} );

	it( 'uses the design-system breakpoints as viewports', () => {
		expect( settings.viewport ).toEqual( {
			mobile: token( tokens.layout.tokens, 'breakpoint-mobile' ),
			tablet: token( tokens.layout.tokens, 'breakpoint-tablet' ),
		} );
	} );

	it( 'defines the display and text font families', () => {
		const slugs = settings.typography.fontFamilies.map( ( f ) => f.slug );
		expect( slugs ).toEqual( [ 'display', 'text' ] );
	} );

	it( 'self-hosts every font face from files in the theme', () => {
		const faces = settings.typography.fontFamilies.flatMap(
			( family ) => family.fontFace ?? []
		);
		expect( faces.map( ( face ) => face.fontFamily ) ).toEqual(
			expect.arrayContaining( [ 'Schibsted Grotesk', 'Onest' ] )
		);
		for ( const src of faces.flatMap( ( face ) => face.src ) ) {
			const file = new URL(
				src.replace( 'file:./', '../../wp-content/themes/tekseries/' ),
				import.meta.url
			);
			expect( { [ src ]: existsSync( file ) } ).toEqual( {
				[ src ]: true,
			} );
		}
	} );

	it.each( [
		[ 'heading-1', 'h1' ],
		[ 'heading-2', 'h2' ],
		[ 'heading-3', 'h3' ],
		[ 'stat', 'stat' ],
		[ 'footer-display', 'footer-display' ],
		[ 'card-title', 'card-title' ],
		[ 'name', 'name' ],
		[ 'lead', 'lead' ],
		[ 'body-l', 'body-l' ],
		[ 'body', 'body' ],
		[ 'body-s', 'body-s' ],
		[ 'eyebrow', 'eyebrow' ],
		[ 'caption', 'caption' ],
	] )( 'font size %s scales from %s-mobile to %s', ( slug, style ) => {
		const preset = settings.typography.fontSizes.find(
			( s ) => s.slug === slug
		);
		expect( preset?.fluid ).toEqual( {
			min: rem( typeStyle( `${ style }-mobile` ) ),
			max: rem( typeStyle( style ) ),
		} );
	} );

	it( 'has every design-system spacing step', () => {
		for ( const { name, value } of tokens.spacing.tokens ) {
			const slug = name.replace( 'space-', '' );
			const entry = settings.spacing.spacingSizes.find(
				( s ) => s.slug === slug
			);
			expect( { [ name ]: entry?.size } ).toEqual( { [ name ]: value } );
		}
	} );

	it( 'has every design-system radius at its desktop size', () => {
		for ( const { name, value } of tokens.radius.tokens ) {
			const slug = name.replace( 'radius-', '' );
			const entry = settings.border.radiusSizes.find(
				( r ) => r.slug === slug
			);
			const size = entry?.size ?? '';
			const fluid = size.startsWith( 'clamp(' );
			expect( { [ name ]: fluid ? clampMax( size ) : size } ).toEqual( {
				[ name ]: fluid ? rem( value ) : value,
			} );
		}
	} );

	it( 'only references presets that exist', () => {
		const refs = [
			...JSON.stringify( theme.styles ).matchAll(
				/var:preset\|([a-z-]+)\|([a-z0-9-]+)/g
			),
		];
		expect( refs.length ).toBeGreaterThan( 0 );
		for ( const [ ref, type = '', slug ] of refs ) {
			expect( { [ ref ]: presets[ type ] ?? [] } ).toEqual( {
				[ ref ]: expect.arrayContaining( [ slug ] ),
			} );
		}
	} );

	it( 'has block markup that only uses presets that exist', () => {
		const attributes: Record< string, string > = {
			textColor: 'color',
			backgroundColor: 'color',
			gradient: 'gradient',
			fontSize: 'font-size',
			fontFamily: 'font-family',
		};
		for ( const dir of [ 'patterns', 'parts', 'templates' ] ) {
			for ( const file of readdirSync( new URL( dir, THEME ) ) ) {
				const markup = readFileSync(
					new URL( `${ dir }/${ file }`, THEME ),
					'utf8'
				);
				const refs = [
					...markup.matchAll(
						/var:preset\|([a-z-]+)\|([a-z0-9-]+)/g
					),
					...markup.matchAll(
						/"(textColor|backgroundColor|gradient|fontSize|fontFamily)":"([a-z0-9-]+)"/g
					),
				];
				for ( const [ ref, type = '', slug ] of refs ) {
					const key = `${ dir }/${ file } ${ ref }`;
					expect( {
						[ key ]: presets[ attributes[ type ] ?? type ] ?? [],
					} ).toEqual( {
						[ key ]: expect.arrayContaining( [ slug ] ),
					} );
				}
			}
		}
	} );
} );
