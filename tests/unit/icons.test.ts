import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const PLUGIN = new URL(
	'../../wp-content/plugins/tekseries-blocks/',
	import.meta.url
);
const THEME = new URL( '../../wp-content/themes/tekseries/', import.meta.url );

const names = [
	...readFileSync( new URL( 'includes/icons.php', PLUGIN ), 'utf8' ).matchAll(
		/^\t\t'([a-z0-9_]+)'\s+=>/gm
	),
].map( ( [ , name = '' ] ) => name );
const svgs = readdirSync( new URL( 'assets/icons', PLUGIN ) ).filter(
	( file ) => file.endsWith( '.svg' )
);

describe( 'tekseries icon collection', () => {
	it( 'lists icons', () => {
		expect( names.length ).toBeGreaterThan( 100 );
	} );

	it( 'has exactly one SVG per listed icon', () => {
		expect( svgs.sort() ).toEqual(
			names.map( ( name ) => `${ name }.svg` ).sort()
		);
	} );

	it.each( svgs )(
		'%s is a 24px Material Symbols path that survives core sanitising',
		( file ) => {
			const svg = readFileSync(
				new URL( `assets/icons/${ file }`, PLUGIN ),
				'utf8'
			);
			expect( svg ).toMatch(
				/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" height="24" viewBox="0 -960 960 960" width="24">(<path d="[^"]+"\/>)+<\/svg>\n$/
			);
		}
	);

	it( 'covers every tekseries icon the theme references', () => {
		const dirs = [ 'patterns', 'parts', 'templates' ];
		for ( const dir of dirs ) {
			for ( const file of readdirSync( new URL( dir, THEME ) ) ) {
				const source = readFileSync(
					new URL( `${ dir }/${ file }`, THEME ),
					'utf8'
				);
				for ( const [ , name = '' ] of source.matchAll(
					/"icon":"tekseries\/([a-z0-9_]+)"/g
				) ) {
					expect( { [ `${ dir }/${ file }` ]: names } ).toEqual( {
						[ `${ dir }/${ file }` ]: expect.arrayContaining( [
							name,
						] ),
					} );
				}
			}
		}
	} );
} );
