import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const THEME = '../../wp-content/themes/tekseries';
const PLUGIN = '../../wp-content/plugins/tekseries-blocks';

function read( relativePath: string ): string {
	return readFileSync( new URL( relativePath, import.meta.url ), 'utf8' );
}

// Parses a WordPress file header (style.css or a plugin's main PHP file).
function header( source: string, field: string ): string | undefined {
	const match = source.match(
		new RegExp( `^\\s*\\*?\\s*${ field }:\\s*(.+)$`, 'm' )
	);
	return match?.[ 1 ]?.trim();
}

describe( 'tekseries theme', () => {
	const style = read( `${ THEME }/style.css` );

	it( 'uses theme.json schema version 3', () => {
		const themeJson = JSON.parse( read( `${ THEME }/theme.json` ) );
		expect( themeJson.version ).toBe( 3 );
	} );

	it( 'declares the supported WordPress and PHP versions', () => {
		expect( header( style, 'Requires at least' ) ).toBe( '7.1' );
		expect( header( style, 'Requires PHP' ) ).toBe( '8.2' );
		expect( header( style, 'Text Domain' ) ).toBe( 'tekseries' );
	} );
} );

describe( 'tekseries-blocks plugin', () => {
	const main = read( `${ PLUGIN }/tekseries-blocks.php` );

	it( 'declares the supported WordPress and PHP versions', () => {
		expect( header( main, 'Requires at least' ) ).toBe( '7.1' );
		expect( header( main, 'Requires PHP' ) ).toBe( '8.2' );
		expect( header( main, 'Text Domain' ) ).toBe( 'tekseries-blocks' );
	} );

	it( 'keeps the header version in sync with package.json', () => {
		const pkg = JSON.parse( read( `${ PLUGIN }/package.json` ) );
		expect( header( main, 'Version' ) ).toBe( pkg.version );
	} );
} );
