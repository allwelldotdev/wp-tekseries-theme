// What an event countdown shows at a given moment. render.php works the same
// figures out on the server (tekseries_blocks_event_countdown() in
// includes/events.php): keep the two alike.

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * An event's times, in milliseconds since 1970.
 */
export type When = {
	/** The start; for an event without a start time, the start of its day. */
	start: number;
	/** The end of the event's day. */
	end: number;
	/** Whether the event has a start time. */
	timed: boolean;
};

/**
 * What the countdown shows.
 */
export type Reading = {
	/** Before the start, from the start to the end of the day, or later. */
	phase: 'before' | 'during' | 'after';
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
};

/**
 * Reads the countdown of an event at a moment.
 *
 * With a start time, the days, hours, minutes and seconds left are what a
 * clock shows. Without one only days count, and they are the days on a
 * calendar: an event the day after tomorrow is 2 days away all day long.
 *
 * @param when The event's times.
 * @param now  The moment, in milliseconds since 1970.
 * @return The reading.
 */
export const read = ( when: When, now: number ): Reading => {
	if ( now >= when.end ) {
		return { phase: 'after', days: 0, hours: 0, minutes: 0, seconds: 0 };
	}
	if ( now >= when.start ) {
		return { phase: 'during', days: 0, hours: 0, minutes: 0, seconds: 0 };
	}
	const left = when.start - now;
	if ( ! when.timed ) {
		return {
			phase: 'before',
			days: Math.ceil( left / DAY ),
			hours: 0,
			minutes: 0,
			seconds: 0,
		};
	}
	return {
		phase: 'before',
		days: Math.floor( left / DAY ),
		hours: Math.floor( ( left % DAY ) / HOUR ),
		minutes: Math.floor( ( left % HOUR ) / MINUTE ),
		seconds: Math.floor( ( left % MINUTE ) / SECOND ),
	};
};

/**
 * The words the server sends. A count comes as [ one, many ].
 */
export type Words = {
	/** Lines with "%d" for the number: "In %d days". */
	inDays: [ string, string ];
	inHours: [ string, string ];
	inMinutes: [ string, string ];
	/** The name under the days figure. */
	day: [ string, string ];
	/** On the day of an event without a start time. */
	today: string;
	/** From an event's start time to the end of its day. */
	now: string;
};

/**
 * Says a reading in a few words, by its largest unit: "In 12 days",
 * "In 5 hours", "In 20 min", "Today" or "Happening now". A started minute
 * counts, so the last minute reads "In 1 min".
 *
 * @param reading The reading; one with the phase "after" has nothing to say.
 * @param timed   Whether the event has a start time.
 * @param words   The words to use.
 * @return The line, or an empty string after the event's day.
 */
export const say = (
	reading: Reading,
	timed: boolean,
	words: Words
): string => {
	if ( reading.phase === 'after' ) {
		return '';
	}
	if ( reading.phase === 'during' ) {
		return timed ? words.now : words.today;
	}
	const count = ( [ one, many ]: [ string, string ], n: number ) =>
		( n === 1 ? one : many ).replace( '%d', String( n ) );
	if ( reading.days > 0 ) {
		return count( words.inDays, reading.days );
	}
	if ( reading.hours > 0 ) {
		return count( words.inHours, reading.hours );
	}
	return count(
		words.inMinutes,
		reading.minutes + ( reading.seconds > 0 ? 1 : 0 )
	);
};

/**
 * Writes a number the way a clock does: at least two figures.
 *
 * @param n The number.
 * @return The figures.
 */
export const two = ( n: number ): string => String( n ).padStart( 2, '0' );
