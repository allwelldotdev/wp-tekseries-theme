// Downloads the Material Symbols Rounded SVGs (weight 400, fill 0, grade 0,
// optical size 24, as in the design) for every icon listed in the plugin's
// includes/icons.php, and removes SVGs that are no longer listed.
// Usage: npm run icons
import { readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const pluginDir = path.join(
	import.meta.dirname,
	'..',
	'wp-content/plugins/tekseries-blocks'
);
const iconsDir = path.join( pluginDir, 'assets/icons' );
const source = ( name ) =>
	`https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/${ name }/default/24px.svg`;

const php = readFileSync(
	path.join( pluginDir, 'includes/icons.php' ),
	'utf8'
);
const names = [ ...php.matchAll( /^\t\t'([a-z0-9_]+)'\s+=>/gm ) ].map(
	( match ) => match[ 1 ]
);
if ( ! names.length ) {
	throw new Error( 'No icon names found in includes/icons.php' );
}

for ( const name of names ) {
	const response = await fetch( source( name ) );
	const svg = ( await response.text() ).trim();
	if ( ! response.ok || ! svg.startsWith( '<svg' ) ) {
		throw new Error(
			`${ name }: ${ response.status } from ${ source( name ) }`
		);
	}
	writeFileSync( path.join( iconsDir, `${ name }.svg` ), svg + '\n' );
}

const listed = new Set( names.map( ( name ) => `${ name }.svg` ) );
const stale = readdirSync( iconsDir ).filter(
	( file ) => file.endsWith( '.svg' ) && ! listed.has( file )
);
for ( const file of stale ) {
	rmSync( path.join( iconsDir, file ) );
}

// eslint-disable-next-line no-console
console.log( `${ names.length } icons written, ${ stale.length } removed` );
