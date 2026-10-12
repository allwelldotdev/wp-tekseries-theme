// Where Google Maps serves a map made for embedding: its embed path, then a
// query or a further path. render.php checks the same before it prints a
// frame.
const EMBED = /^https:\/\/www\.google\.com\/maps\/embed[?/]/;

// The map's address from what an editor pasted: Google's whole
// `<iframe src="…">` snippet, or the address alone. Empty when it is neither.
export const embedSource = ( pasted: string ): string => {
	const found = pasted.match( /<iframe[^>]*\ssrc=(["'])(.*?)\1/i )?.[ 2 ];
	const source = ( found ?? pasted ).trim().replaceAll( '&amp;', '&' );
	return EMBED.test( source ) ? source : '';
};
