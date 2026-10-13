import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const THEME = new URL( '../../wp-content/themes/tekseries/', import.meta.url );

const read = ( path: string ) => readFileSync( new URL( path, THEME ), 'utf8' );
const files = ( dir: string ) =>
	readdirSync( new URL( dir, THEME ) ).map(
		( name ) => `${ dir }/${ name }`
	);

const templates = files( 'templates' );
const markup = [ ...templates, ...files( 'parts' ), ...files( 'patterns' ) ];
const themeJson = JSON.parse( read( 'theme.json' ) ) as {
	templateParts: { name: string; area: string }[];
};

describe( 'theme templates', () => {
	it.each( templates )(
		'%s has the header, a main and the footer',
		( file ) => {
			const source = read( file );
			expect( source ).toContain(
				'<!-- wp:template-part {"slug":"header","tagName":"header"} /-->'
			);
			expect( source ).toContain( '"tagName":"main"' );
			expect( source ).toContain(
				'<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->'
			);
		}
	);

	it( 'declares every template part it uses', () => {
		const declared = themeJson.templateParts.map( ( part ) => part.name );
		for ( const file of markup ) {
			for ( const [ , slug = '' ] of read( file ).matchAll(
				/wp:template-part \{"slug":"([^"]+)"/g
			) ) {
				expect( { [ file ]: declared } ).toEqual( {
					[ file ]: expect.arrayContaining( [ slug ] ),
				} );
				expect(
					existsSync( new URL( `parts/${ slug }.html`, THEME ) )
				).toBe( true );
			}
		}
	} );

	it( 'only references theme patterns that exist', () => {
		const slugs = files( 'patterns' ).map(
			( file ) => read( file ).match( /^ \* Slug:\s*(\S+)$/m )?.[ 1 ]
		);
		for ( const file of markup ) {
			for ( const [ , slug = '' ] of read( file ).matchAll(
				/wp:pattern \{"slug":"(tekseries\/[^"]+)"/g
			) ) {
				expect( { [ file ]: slugs } ).toEqual( {
					[ file ]: expect.arrayContaining( [ slug ] ),
				} );
			}
		}
	} );

	// The owner chose, in the editor, which plum hero bands rise in when
	// the page opens (the class "ts-intro"). The others stay still.
	it( 'gives the entrance to the hero bands the owner marked, and only those', () => {
		const rising = files( 'patterns' )
			.filter( ( file ) =>
				/"className":"is-style-hero-plum[^"]* ts-intro"/.test(
					read( file )
				)
			)
			.map( ( file ) => file.replace( /^patterns\/|\.php$/g, '' ) );
		expect( rising.sort() ).toEqual( [
			'contact-hero',
			'gallery-hero',
			'job-dashboard-hero',
			'job-series-hero',
			'job-submit-hero',
			'template-event-type',
			'template-events',
			'template-legal',
			'template-news',
		] );
	} );
} );
