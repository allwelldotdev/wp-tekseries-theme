// What a deadline countdown shows at a given moment. The server works the
// same figures and words out (tekseries_blocks_deadline_view() and the
// lines after it in includes/deadline.php): keep the two alike.

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * What the countdown shows: the days, hours, minutes and seconds left, as a
 * clock shows them, and whether the deadline has passed.
 */
export type Reading = {
	closed: boolean;
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
};

/**
 * Reads the countdown to a deadline at a moment.
 *
 * @param deadline The deadline, in milliseconds since 1970.
 * @param now      The moment, in milliseconds since 1970.
 * @return The reading. At and after the deadline everything is 0.
 */
export const read = ( deadline: number, now: number ): Reading => {
	const left = Math.max( 0, deadline - now );
	return {
		closed: left === 0,
		days: Math.floor( left / DAY ),
		hours: Math.floor( ( left % DAY ) / HOUR ),
		minutes: Math.floor( ( left % HOUR ) / MINUTE ),
		seconds: Math.floor( ( left % MINUTE ) / SECOND ),
	};
};

/**
 * The words the server sends. A count comes as [ one, many ] with "%d" for
 * the number; "%s" and "%1$s" to "%3$s" stand for the parts of a sentence.
 */
export type Words = {
	/** "%d days left to apply". */
	left: [ string, string ];
	/** In the last 24 hours. */
	lastDay: string;
	/** "Applications close in %s." */
	closeIn: string;
	/** The server's line in the last 24 hours: the script says the hours. */
	soon: string;
	/** After the deadline. */
	closed: string;
	days: [ string, string ];
	hours: [ string, string ];
	minutes: [ string, string ];
	/** "%1$s and %2$s". */
	two: string;
	/** "%1$s, %2$s and %3$s". */
	three: string;
};

const count = ( [ one, many ]: [ string, string ], n: number ) =>
	( n === 1 ? one : many ).replace( '%d', String( n ) );

const fill = ( text: string, parts: string[] ) =>
	parts.reduce(
		( done, part, i ) => done.replace( `%${ i + 1 }$s`, part ),
		text
	);

/**
 * Says the days left, for the line in a band: "12 days left to apply", or
 * "Last day to apply" in the last 24 hours.
 *
 * @param reading The reading.
 * @param words   The words to use.
 * @return The line, or an empty string once closed.
 */
export const daysLine = (
	reading: Reading,
	words: Pick< Words, 'left' | 'lastDay' >
): string => {
	if ( reading.closed ) {
		return '';
	}
	return reading.days > 0 ? count( words.left, reading.days ) : words.lastDay;
};

/**
 * Says the time left for screen readers: "Applications close in 12 days,
 * 4 hours and 30 minutes." Leading units that are 0 are left out, and in
 * the last hour a started minute counts, so the last minute reads
 * "1 minute". The server, which cannot keep a clock right, says only the
 * days, or "less than a day".
 *
 * @param reading The reading.
 * @param words   The words to use.
 * @return The sentence.
 */
export const line = ( reading: Reading, words: Words ): string => {
	if ( reading.closed ) {
		return words.closed;
	}
	const hours = count( words.hours, reading.hours );
	const minutes = count( words.minutes, reading.minutes );
	let left;
	if ( reading.days > 0 ) {
		left = fill( words.three, [
			count( words.days, reading.days ),
			hours,
			minutes,
		] );
	} else if ( reading.hours > 0 ) {
		left = fill( words.two, [ hours, minutes ] );
	} else {
		left = count(
			words.minutes,
			Math.max( 1, reading.minutes + ( reading.seconds > 0 ? 1 : 0 ) )
		);
	}
	return words.closeIn.replace( '%s', left );
};
