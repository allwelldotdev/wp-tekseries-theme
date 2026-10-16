// Pure helpers for the poster frame picker: which moments to grab, and how
// the poster is named. Kept free of the DOM so they can be unit tested.

/** The first frames are often black and the last a title card. */
const BAND = [ 0.1, 0.9 ] as const;

/**
 * A quarter, half and three quarters of the way through.
 *
 * @param duration The video's length, in seconds.
 */
export function defaultTimes( duration: number ): number[] {
	return [ 0.25, 0.5, 0.75 ].map( ( share ) => round( duration * share ) );
}

/**
 * Three new moments, in order, spread over the 10–90% band.
 *
 * @param duration The video's length, in seconds.
 * @param random   A source of numbers from 0 up to 1.
 */
export function otherTimes(
	duration: number,
	random: () => number = Math.random
): number[] {
	// One moment from each third of the band keeps them apart.
	const [ from, to ] = BAND;
	const third = ( to - from ) / 3;
	return [ 0, 1, 2 ].map( ( i ) =>
		round( duration * ( from + third * ( i + random() ) ) )
	);
}

/**
 * The middle frame, used when a video in an album has no poster yet.
 *
 * @param duration The video's length, in seconds.
 */
export function middleTime( duration: number ): number {
	return round( duration / 2 );
}

/**
 * Keeps a moment inside the video, to a tenth of a second.
 *
 * @param time     The moment, in seconds.
 * @param duration The video's length, in seconds.
 */
export function clampTime( time: number, duration: number ): number {
	const last = Math.max( 0, duration - 0.1 );
	return round( Math.min( Math.max( time, 0 ), last ) );
}

/**
 * "1:05", or "1:02:05" for an hour or more. A video under a minute reads to
 * a tenth of a second, "0:02.5", or its frames could all read "0:00".
 *
 * @param seconds  The moment, in seconds.
 * @param duration The video's length, in seconds.
 */
export function formatTime( seconds: number, duration = Infinity ): string {
	const time = Math.max( 0, seconds );
	const whole = Math.floor( time );
	const h = Math.floor( whole / 3600 );
	const m = Math.floor( ( whole % 3600 ) / 60 );
	const s = String( whole % 60 ).padStart( 2, '0' );
	const tenth =
		duration < 60 ? `.${ Math.floor( ( time - whole ) * 10 + 1e-6 ) }` : '';
	return h
		? `${ h }:${ String( m ).padStart( 2, '0' ) }:${ s }`
		: `${ m }:${ s }${ tenth }`;
}

/**
 * "webinar-highlights.mp4" gives "webinar-highlights-poster.jpg".
 *
 * @param src The video file's address.
 */
export function posterFileName( src: string ): string {
	const file = decodeURIComponent(
		src.split( /[?#]/ )[ 0 ]?.split( '/' ).pop() ?? ''
	);
	const base = file.replace( /\.[^.]+$/, '' ) || 'video';
	return `${ base }-poster.jpg`;
}

/**
 * A canvas no wider than 1920px, in the video's proportions.
 *
 * @param width  The video's width, in pixels.
 * @param height The video's height, in pixels.
 * @param max    The widest canvas allowed.
 */
export function frameSize(
	width: number,
	height: number,
	max = 1920
): { width: number; height: number } {
	const scale = width > max ? max / width : 1;
	return {
		width: Math.round( width * scale ),
		height: Math.round( height * scale ),
	};
}

function round( time: number ): number {
	return Math.round( time * 10 ) / 10;
}
