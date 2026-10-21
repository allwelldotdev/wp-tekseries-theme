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

// A date and time as numbers, [ year, month, day, hour, minute, second ],
// read as if they were UTC.
const asUtc = ( [
	year = 1970,
	month = 1,
	day = 1,
	hour = 0,
	minute = 0,
	second = 0,
]: number[] ) => Date.UTC( year, month - 1, day, hour, minute, second );

const UNITS = [ 'year', 'month', 'day', 'hour', 'minute', 'second' ];

// How far a zone's clock is ahead of UTC at a moment, in milliseconds.
const offsetAt = ( zone: string, moment: number ): number => {
	const parts = new Intl.DateTimeFormat( 'en-US', {
		timeZone: zone,
		hourCycle: 'h23',
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
	} ).formatToParts( moment );
	const wall = asUtc(
		UNITS.map( ( unit ) =>
			Number( parts.find( ( { type } ) => type === unit )?.value )
		)
	);
	return wall - Math.floor( moment / SECOND ) * SECOND;
};

/**
 * Reads a deadline's date and time in a time zone, as the server does
 * (tekseries_blocks_parse_deadline()). A time a clock change skips is moved
 * on by the change, as PHP moves it.
 *
 * @param value "YYYY-MM-DDTHH:MM:SS", or without the seconds.
 * @param zone  A time zone name, e.g. "Africa/Lagos".
 * @return The moment in milliseconds since 1970, or NaN when the value or
 *         the zone is not valid.
 */
export const zonedTime = ( value: string, zone: string ): number => {
	const found = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
		value
	);
	if ( ! found ) {
		return NaN;
	}
	const wall = asUtc(
		found.slice( 1 ).map( ( part ) => Number( part ?? 0 ) )
	);
	try {
		// Guess the offset at the wall time read as UTC, take it at the
		// moment that guess gives, then at the moment that one gives: the
		// two agree except in an hour a clock change skips.
		const before = offsetAt( zone, wall - offsetAt( zone, wall ) );
		const after = offsetAt( zone, wall - before );
		// In a skipped hour PHP takes the offset from before the change,
		// the smaller one, which moves the time on.
		return wall - Math.min( before, after );
	} catch {
		return NaN;
	}
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
