import { describe, expect, it } from 'vitest';

import {
	read,
	say,
	two,
	type Words,
} from '../../wp-content/plugins/tekseries-blocks/src/event-countdown/time';

const at = ( iso: string ) => Date.parse( iso );

// An event on 7 November 2026 in Nigeria (UTC+1), with and without a start
// time of 11:00.
const timed = {
	start: at( '2026-11-07T11:00:00+01:00' ),
	end: at( '2026-11-08T00:00:00+01:00' ),
	timed: true,
};
const dayOnly = {
	start: at( '2026-11-07T00:00:00+01:00' ),
	end: at( '2026-11-08T00:00:00+01:00' ),
	timed: false,
};
const words: Words = {
	inDays: [ 'In %d day', 'In %d days' ],
	inHours: [ 'In %d hour', 'In %d hours' ],
	inMinutes: [ 'In %d min', 'In %d min' ],
	day: [ 'day', 'days' ],
	today: 'Today',
	now: 'Happening now',
};
const line = ( when: typeof timed, iso: string ) =>
	say( read( when, at( iso ) ), when.timed, words );

describe( 'event countdown', () => {
	it( 'counts days, hours, minutes and seconds to a start time', () => {
		expect( read( timed, at( '2026-10-13T09:29:45+01:00' ) ) ).toEqual( {
			phase: 'before',
			days: 25,
			hours: 1,
			minutes: 30,
			seconds: 15,
		} );
		expect( read( timed, at( '2026-11-07T10:59:59+01:00' ) ) ).toEqual( {
			phase: 'before',
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 1,
		} );
	} );

	it( 'counts calendar days to an event without a start time', () => {
		// The day after tomorrow is two days away, morning and night.
		for ( const time of [ '00:00:00', '09:00:00', '23:59:59' ] ) {
			expect(
				read( dayOnly, at( `2026-11-05T${ time }+01:00` ) )
			).toEqual( {
				phase: 'before',
				days: 2,
				hours: 0,
				minutes: 0,
				seconds: 0,
			} );
		}
		expect( read( dayOnly, at( '2026-11-06T23:59:59+01:00' ) ).days ).toBe(
			1
		);
	} );

	it( 'is "during" from the start to the end of the day, then over', () => {
		expect( read( timed, at( '2026-11-07T11:00:00+01:00' ) ).phase ).toBe(
			'during'
		);
		expect( read( timed, at( '2026-11-07T23:59:59+01:00' ) ).phase ).toBe(
			'during'
		);
		expect( read( timed, at( '2026-11-08T00:00:00+01:00' ) ).phase ).toBe(
			'after'
		);
		// Without a start time the whole day is the event.
		expect( read( dayOnly, at( '2026-11-07T00:00:00+01:00' ) ).phase ).toBe(
			'during'
		);
		expect( read( dayOnly, at( '2026-11-06T23:59:59+01:00' ) ).phase ).toBe(
			'before'
		);
	} );

	it( 'does not depend on the time zone of the visitor', () => {
		// The same moment, written as it is in Lagos and in New York.
		expect( read( timed, at( '2026-11-07T10:00:00+01:00' ) ) ).toEqual(
			read( timed, at( '2026-11-07T04:00:00-05:00' ) )
		);
	} );

	it( 'says the reading by its largest unit', () => {
		expect( line( timed, '2026-10-13T09:29:45+01:00' ) ).toBe(
			'In 25 days'
		);
		expect( line( timed, '2026-11-06T10:00:00+01:00' ) ).toBe( 'In 1 day' );
		expect( line( timed, '2026-11-06T11:00:01+01:00' ) ).toBe(
			'In 23 hours'
		);
		expect( line( timed, '2026-11-07T09:30:00+01:00' ) ).toBe(
			'In 1 hour'
		);
		expect( line( timed, '2026-11-07T10:40:00+01:00' ) ).toBe(
			'In 20 min'
		);
		expect( line( timed, '2026-11-07T10:39:30+01:00' ) ).toBe(
			'In 21 min'
		);
		expect( line( timed, '2026-11-07T10:59:59+01:00' ) ).toBe( 'In 1 min' );
		expect( line( timed, '2026-11-07T11:00:00+01:00' ) ).toBe(
			'Happening now'
		);
		expect( line( dayOnly, '2026-11-05T15:00:00+01:00' ) ).toBe(
			'In 2 days'
		);
		expect( line( dayOnly, '2026-11-07T08:00:00+01:00' ) ).toBe( 'Today' );
		expect( line( timed, '2026-11-08T00:00:00+01:00' ) ).toBe( '' );
	} );

	it( 'writes clock figures with two digits', () => {
		expect( [ two( 0 ), two( 7 ), two( 42 ) ] ).toEqual( [
			'00',
			'07',
			'42',
		] );
	} );
} );
