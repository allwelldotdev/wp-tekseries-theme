import { existsSync, readdirSync, readFileSync } from 'node:fs';
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

	it( 'has every topic icon and default icon a post can show', () => {
		const meta = readFileSync(
			new URL( 'includes/meta.php', PLUGIN ),
			'utf8'
		);
		const body = ( fn: string ) =>
			meta.match(
				new RegExp( `function ${ fn }\\(.*?\\n}`, 's' )
			)?.[ 0 ] ?? '';
		const topics = [
			...body( 'tekseries_blocks_topic_icons' ).matchAll(
				/^\t\t'([a-z0-9_]+)',$/gm
			),
		].map( ( [ , name = '' ] ) => name );
		const defaults = [
			...body( 'tekseries_blocks_event_type_icons' ).matchAll(
				/=> '([a-z0-9_]+)'/g
			),
			...body( 'tekseries_blocks_default_icon' ).matchAll(
				/return '([a-z0-9_]+)'/g
			),
		].map( ( [ , name = '' ] ) => name );

		expect( topics.length ).toBeGreaterThanOrEqual( 25 );
		expect( defaults ).toEqual( [
			'videocam',
			'co_present',
			'emoji_events',
			'newspaper',
			'event',
		] );
		expect( names ).toEqual( expect.arrayContaining( topics ) );
		expect( topics ).toEqual( expect.arrayContaining( defaults ) );
	} );

	it( "covers every icon the plugin's PHP names", () => {
		const files = [
			...[ 'includes/', 'templates/wpjm/' ].flatMap( ( path ) =>
				readdirSync( new URL( path, PLUGIN ) ).map(
					( file ) => path + file
				)
			),
			...readdirSync( new URL( 'src/', PLUGIN ) )
				.map( ( block ) => `src/${ block }/render.php` )
				.filter( ( file ) => existsSync( new URL( file, PLUGIN ) ) ),
		];
		// (A script's namespace looks like an icon id, and is not one.)
		const used = files.flatMap( ( file ) =>
			[
				...readFileSync( new URL( file, PLUGIN ), 'utf8' ).matchAll(
					/(?:tekseries_blocks_icon_svg\( '|(?<!data-wp-interactive'\s*(?:,|=>)\s*)'tekseries\/)([a-z0-9_]+)'/g
				),
			].map( ( [ , name = '' ] ) => name )
		);
		expect( used ).toEqual(
			expect.arrayContaining( [ 'apps', 'arrow_outward', 'grid_view' ] )
		);
		expect( names ).toEqual( expect.arrayContaining( used ) );
	} );

	it( 'has an icon for every job dashboard action', () => {
		const dashboard = readFileSync(
			new URL( 'includes/job-dashboard.php', PLUGIN ),
			'utf8'
		);
		const map =
			dashboard.match(
				/function tekseries_blocks_job_action_icon\(.*?\n}/s
			)?.[ 0 ] ?? '';
		const icons = [ ...map.matchAll( /'([a-z0-9_]+)'(?:;|,)$/gm ) ].map(
			( [ , name = '' ] ) => name
		);
		expect( icons ).toHaveLength( 9 );
		expect( names ).toEqual( expect.arrayContaining( icons ) );
	} );

	it( 'has an icon for every job type', () => {
		const wpjm = readFileSync(
			new URL( 'includes/wpjm.php', PLUGIN ),
			'utf8'
		);
		const map =
			wpjm.match(
				/function tekseries_blocks_job_type_icons\(.*?\n}/s
			)?.[ 0 ] ?? '';
		const icons = [ ...map.matchAll( /=> '([a-z0-9_]+)'/g ) ].map(
			( [ , name = '' ] ) => name
		);
		expect( icons ).toHaveLength( 8 );
		expect( names ).toEqual(
			expect.arrayContaining( [ ...icons, 'work' ] )
		);
	} );

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
